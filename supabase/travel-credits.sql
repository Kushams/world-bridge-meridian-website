-- Travel Credits, vouchers and the Invite Program. Run AFTER gift-cards.sql.
-- Then deploy the edge functions (submit-form, notify-form-submission,
-- notify-status-change, deliver-gift-cards) from this repo.
--
-- Model (same idea as Travala):
--   * Standard credits: bought, refunded, or redeemed from a gift card. Never expire. 1 credit = US$1.
--   * Promo credits:    given as promotions / vouchers / invite rewards. They expire, and
--                       usable on any booking up to 25% of it (see /travel-credits).
-- Everything a customer holds is a "bucket" with a balance; every use is a ledger line.
-- Staff do the work with the helper functions below, in the SQL editor:
--   select staff_apply_credits('client@email.com', 1500, 100, '<request id>', 'Italy trip');
--   select staff_refund_credits('client@email.com', 1500, '<request id>', 'Italy trip cancelled');
--   select staff_grant_promo('client@email.com', 100, 90, 'Birthday gift');
--   select staff_create_voucher(100, 90, 60);   -- US$100, credit valid 90 days, redeem within 60 days

-- 1. Form types and gift card changes ------------------------------------------------
alter table public.form_submissions
  drop constraint form_submissions_form_type_check,
  add constraint form_submissions_form_type_check
    check (form_type in ('contact', 'newsletter', 'journey-request', 'travel-details', 'gift-card', 'travel-credits'));

alter table public.gift_cards
  drop constraint gift_cards_status_check,
  add constraint gift_cards_status_check check (status in ('active', 'redeemed', 'void')),
  drop constraint gift_cards_amount_cents_check,
  add constraint gift_cards_amount_cents_check check (amount_cents between 1000 and 2500000);

alter table public.gift_cards
  add column if not exists kind text not null default 'gift_card' check (kind in ('gift_card', 'voucher')),
  add column if not exists redeem_by timestamptz,
  add column if not exists promo_valid_days integer;

-- 2. Credit buckets and their ledger ------------------------------------------------
create table if not exists public.travel_credit_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('standard', 'promo')),
  source text not null check (source in ('purchase', 'gift_card', 'refund', 'promo', 'voucher', 'invite', 'cashback', 'adjustment')),
  amount_cents integer not null check (amount_cents > 0),
  balance_cents integer not null check (balance_cents >= 0),
  expires_at timestamptz,
  note text,
  source_ref uuid,
  created_at timestamptz not null default now(),
  check ((kind = 'promo' and expires_at is not null) or (kind = 'standard' and expires_at is null))
);
create index if not exists travel_credit_buckets_user on public.travel_credit_buckets (user_id);
alter table public.travel_credit_buckets enable row level security;
create policy "Owners read their credits" on public.travel_credit_buckets
  for select to authenticated using (user_id = auth.uid());

create table if not exists public.travel_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  bucket_id uuid not null references public.travel_credit_buckets (id) on delete cascade,
  delta_cents integer not null check (delta_cents <> 0),
  note text,
  submission_id uuid references public.form_submissions (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.travel_credit_ledger enable row level security;
create policy "Owners read their credit history" on public.travel_credit_ledger
  for select to authenticated
  using (exists (select 1 from public.travel_credit_buckets b where b.id = bucket_id and b.user_id = auth.uid()));

create or replace function public.apply_credit_ledger()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare b public.travel_credit_buckets;
begin
  select * into b from public.travel_credit_buckets where id = new.bucket_id for update;
  if not found then
    raise exception 'Credit bucket not found';
  end if;
  if new.delta_cents < 0 and b.expires_at is not null and b.expires_at < now() then
    raise exception 'These promo credits have expired';
  end if;
  update public.travel_credit_buckets set balance_cents = balance_cents + new.delta_cents where id = new.bucket_id;
  return new;
end;
$fn$;
create trigger travel_credit_ledger_apply before insert on public.travel_credit_ledger
  for each row execute function public.apply_credit_ledger();

-- 3. Redeem a gift card or voucher code into the signed-in customer's credits ------------
create or replace function public.redeem_gift_card(p_code text)
returns table (ok boolean, message text, balance_cents integer)
language plpgsql security definer set search_path = public as $fn$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  norm text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  fails int;
  c public.gift_cards;
  credited int;
begin
  if uid is null then
    return query select false, 'Please sign in to redeem a code.', 0;
    return;
  end if;
  select count(*) into fails from public.gift_card_attempts
    where user_id = uid and ok = false and at > now() - interval '1 hour';
  if fails >= 8 then
    return query select false, 'Too many attempts. Please try again in an hour.', 0;
    return;
  end if;
  select * into c from public.gift_cards where replace(code, '-', '') = norm for update;
  if not found or c.status = 'void' or (c.status = 'redeemed' and c.owner_user_id is distinct from uid) then
    insert into public.gift_card_attempts (user_id, ok) values (uid, false);
    return query select false, 'That code was not recognised. Check it and try again.', 0;
    return;
  end if;
  if c.status = 'redeemed' then
    return query select true, 'That code is already in your Travel Credits.', 0;
    return;
  end if;
  if c.kind = 'voucher' and c.redeem_by is not null and c.redeem_by < now() then
    insert into public.gift_card_attempts (user_id, ok) values (uid, false);
    return query select false, 'This voucher has expired.', 0;
    return;
  end if;
  credited := c.balance_cents;
  if c.kind = 'voucher' then
    insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, expires_at, note, source_ref)
    values (uid, 'promo', 'voucher', credited, credited,
            now() + make_interval(days => coalesce(c.promo_valid_days, 90)), 'Travel voucher', c.id);
  else
    insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, note, source_ref)
    values (uid, 'standard', 'gift_card', credited, credited, 'Gift card', c.id);
  end if;
  update public.gift_cards set owner_user_id = uid, claimed_at = now(), status = 'redeemed', balance_cents = 0 where id = c.id;
  insert into public.gift_card_attempts (user_id, ok) values (uid, true);
  return query select true,
    case when c.kind = 'voucher' then 'Voucher added to your account as Promo Credits.' else 'Gift card added to your Travel Credits.' end,
    credited;
end;
$fn$;
revoke all on function public.redeem_gift_card(text) from public, anon;
grant execute on function public.redeem_gift_card(text) to authenticated;

-- 4. Buying credits: staff confirm the crypto payment (status -> confirmed) ------------------
create or replace function public.issue_travel_credits()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare amt numeric; uid uuid;
begin
  if new.form_type <> 'travel-credits' or new.status <> 'confirmed' or old.status = 'confirmed' then
    return new;
  end if;
  if exists (select 1 from public.travel_credit_buckets where source = 'purchase' and source_ref = new.id) then
    return new;
  end if;
  amt := nullif(new.payload ->> 'amount', '')::numeric;
  if amt is null or amt < 500 or amt > 25000 then
    raise exception 'Credit amount is out of range (500 to 25,000 USD per purchase). Check the payload.';
  end if;
  select id into uid from auth.users where lower(email) = lower(new.email) and email_confirmed_at is not null;
  if uid is null then
    raise exception 'No confirmed account for %. Ask the client to confirm their email, then retry.', new.email;
  end if;
  insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, note, source_ref)
  values (uid, 'standard', 'purchase', (amt * 100)::int, (amt * 100)::int, 'Purchased credits', new.id);
  return new;
end;
$fn$;
create trigger on_travel_credits_paid after update of status on public.form_submissions
  for each row execute function public.issue_travel_credits();

-- 5. Staff helpers (not callable by customers or the public) ----------------------------
create or replace function public.staff_apply_credits(
  p_email text, p_standard_usd numeric, p_promo_usd numeric default 0,
  p_submission uuid default null, p_note text default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare uid uuid; need int; take int; b record; used_std int := 0; used_promo int := 0;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then raise exception 'No account for %', p_email; end if;
  need := round(coalesce(p_standard_usd, 0) * 100);
  for b in select * from public.travel_credit_buckets
           where user_id = uid and kind = 'standard' and balance_cents > 0 order by created_at for update loop
    exit when need <= 0;
    take := least(need, b.balance_cents);
    insert into public.travel_credit_ledger (bucket_id, delta_cents, note, submission_id) values (b.id, -take, p_note, p_submission);
    need := need - take; used_std := used_std + take;
  end loop;
  if need > 0 then raise exception 'Not enough standard credits (short by US$%)', round(need / 100.0, 2); end if;
  need := round(coalesce(p_promo_usd, 0) * 100);
  for b in select * from public.travel_credit_buckets
           where user_id = uid and kind = 'promo' and balance_cents > 0 and expires_at > now() order by expires_at for update loop
    exit when need <= 0;
    take := least(need, b.balance_cents);
    insert into public.travel_credit_ledger (bucket_id, delta_cents, note, submission_id) values (b.id, -take, p_note, p_submission);
    need := need - take; used_promo := used_promo + take;
  end loop;
  if need > 0 then raise exception 'Not enough unexpired promo credits (short by US$%)', round(need / 100.0, 2); end if;
  return format('Applied US$%s standard and US$%s promo credits', round(used_std / 100.0, 2), round(used_promo / 100.0, 2));
end;
$fn$;

create or replace function public.staff_refund_credits(p_email text, p_usd numeric, p_submission uuid default null, p_note text default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then raise exception 'No account for %', p_email; end if;
  insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, note, source_ref)
  values (uid, 'standard', 'refund', round(p_usd * 100), round(p_usd * 100), coalesce(p_note, 'Refund'), p_submission);
  return format('Returned US$%s to %s as standard credits', p_usd, p_email);
end;
$fn$;

create or replace function public.staff_grant_promo(p_email text, p_usd numeric, p_days integer default 90, p_note text default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then raise exception 'No account for %', p_email; end if;
  insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, expires_at, note)
  values (uid, 'promo', 'promo', round(p_usd * 100), round(p_usd * 100), now() + make_interval(days => p_days), coalesce(p_note, 'Promotion'));
  return format('Granted US$%s promo credits to %s, valid %s days', p_usd, p_email, p_days);
end;
$fn$;

-- Cashback: when a trip is completed and paid, staff award Promo Credits by trip total.
--   US$5,000+ -> 15%,  US$15,000+ -> 20%,  US$30,000+ -> 25%   (90 days). Once per submission.
create or replace function public.staff_award_cashback(p_email text, p_trip_usd numeric, p_submission uuid, p_note text default null)
returns text language plpgsql security definer set search_path = public as $fn$
declare uid uuid; pct numeric; cents int;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then raise exception 'No account for %', p_email; end if;
  if p_submission is null then raise exception 'A submission id is required so cashback is only paid once'; end if;
  if exists (select 1 from public.travel_credit_buckets where source = 'cashback' and source_ref = p_submission) then
    raise exception 'Cashback was already awarded for this booking';
  end if;
  pct := case when p_trip_usd >= 30000 then 0.25 when p_trip_usd >= 15000 then 0.20 when p_trip_usd >= 5000 then 0.15 else 0 end;
  if pct = 0 then return 'Trip is under US$5,000: no cashback tier'; end if;
  cents := round(p_trip_usd * pct * 100);
  insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, expires_at, note, source_ref)
  values (uid, 'promo', 'cashback', cents, cents, now() + interval '90 days', coalesce(p_note, 'Cashback on your journey'), p_submission);
  return format('Awarded US$%s (%s%%) cashback', round(cents / 100.0, 2), pct * 100);
end;
$fn$;
revoke all on function public.staff_award_cashback(text, numeric, uuid, text) from public, anon, authenticated;

create or replace function public.staff_create_voucher(p_usd numeric, p_valid_days integer default 90, p_redeem_within_days integer default 60)
returns text language plpgsql security definer set search_path = public as $fn$
declare v text := public.gen_gift_code();
begin
  insert into public.gift_cards (code, amount_cents, balance_cents, kind, redeem_by, promo_valid_days,
                                 purchaser_email, recipient_email, design)
  values (v, round(p_usd * 100), round(p_usd * 100), 'voucher', now() + make_interval(days => p_redeem_within_days),
          p_valid_days, 'vouchers@worldbridgemeridian.group', 'vouchers@worldbridgemeridian.group', 'classic');
  return v;
end;
$fn$;

revoke all on function public.staff_apply_credits(text, numeric, numeric, uuid, text) from public, anon, authenticated;
revoke all on function public.staff_refund_credits(text, numeric, uuid, text) from public, anon, authenticated;
revoke all on function public.staff_grant_promo(text, numeric, integer, text) from public, anon, authenticated;
revoke all on function public.staff_create_voucher(numeric, integer, integer) from public, anon, authenticated;

create or replace view public.client_credit_balances as
  select u.email,
         sum(b.balance_cents) filter (where b.kind = 'standard') / 100.0 as standard_usd,
         sum(b.balance_cents) filter (where b.kind = 'promo' and b.expires_at > now()) / 100.0 as promo_usd
  from public.travel_credit_buckets b
  join auth.users u on u.id = b.user_id
  group by u.email;
revoke all on public.client_credit_balances from anon, authenticated;

-- 6. Invite Program -----------------------------------------------------------------------
create table if not exists public.invite_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.invite_codes enable row level security;
create policy "Owners read their invite code" on public.invite_codes
  for select to authenticated using (user_id = auth.uid());

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users (id) on delete cascade,
  invitee_id uuid not null unique references auth.users (id) on delete cascade,
  invitee_label text not null,
  status text not null default 'signed_up' check (status in ('signed_up', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.invites enable row level security;
create policy "People see invites they sent or received" on public.invites
  for select to authenticated using (inviter_id = auth.uid() or invitee_id = auth.uid());

create or replace function public.gen_invite_code()
returns text language plpgsql set search_path = public, extensions as $fn$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := gen_random_bytes(8);
  out text := '';
  i int;
begin
  for i in 0..7 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % 31) + 1, 1);
  end loop;
  return out;
end;
$fn$;

create or replace function public.my_invite_code()
returns text language plpgsql security definer set search_path = public as $fn$
declare uid uuid := auth.uid(); c text; tries int := 0;
begin
  if uid is null then return null; end if;
  select code into c from public.invite_codes where user_id = uid;
  if c is not null then return c; end if;
  loop
    begin
      insert into public.invite_codes (user_id, code) values (uid, public.gen_invite_code()) returning code into c;
      return c;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
      select code into c from public.invite_codes where user_id = uid;
      if c is not null then return c; end if;
    end;
  end loop;
end;
$fn$;
revoke all on function public.my_invite_code() from public, anon;
grant execute on function public.my_invite_code() to authenticated;

create or replace function public.claim_invite(p_code text)
returns table (ok boolean, message text)
language plpgsql security definer set search_path = public as $fn$
#variable_conflict use_column
declare uid uuid := auth.uid(); made timestamptz; mail text; inv public.invite_codes;
begin
  if uid is null then
    return query select false, 'Please sign in first.';
    return;
  end if;
  select created_at, email into made, mail from auth.users where id = uid;
  if made < now() - interval '30 days' then
    return query select false, 'Invite links are for new accounts, created in the last 30 days.';
    return;
  end if;
  select * into inv from public.invite_codes where code = upper(trim(coalesce(p_code, '')));
  if not found then
    return query select false, 'That invite link is not valid.';
    return;
  end if;
  if inv.user_id = uid then
    return query select false, 'You cannot use your own invite link.';
    return;
  end if;
  if exists (select 1 from public.invites where invitee_id = uid) then
    return query select false, 'You have already joined through an invite.';
    return;
  end if;
  insert into public.invites (inviter_id, invitee_id, invitee_label)
  values (inv.user_id, uid, left(mail, 1) || '***' || substr(mail, position('@' in mail)));
  return query select true, 'Invite applied. You will both receive rewards after your first completed journey.';
end;
$fn$;
revoke all on function public.claim_invite(text) from public, anon;
grant execute on function public.claim_invite(text) to authenticated;

-- Staff set an invite's status to "completed" once the invited friend's qualifying
-- journey (US$3,000+) has been completed: both people receive US$500 of promo credits.
create or replace function public.reward_invite()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if new.status = 'completed' and old.status <> 'completed' and old.completed_at is null then
    new.completed_at := now();
    insert into public.travel_credit_buckets (user_id, kind, source, amount_cents, balance_cents, expires_at, note, source_ref)
    values
      (new.inviter_id, 'promo', 'invite', 50000, 50000, now() + interval '90 days', 'Invite reward', new.id),
      (new.invitee_id, 'promo', 'invite', 50000, 50000, now() + interval '90 days', 'Invite reward', new.id);
  end if;
  return new;
end;
$fn$;
create trigger invites_reward before update of status on public.invites
  for each row execute function public.reward_invite();
