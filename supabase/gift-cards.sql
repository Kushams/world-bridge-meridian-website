-- Gift cards. Run in the Supabase SQL editor. Then deploy the edge function
-- `deliver-gift-cards` and redeploy `submit-form` and `notify-form-submission`.
--
-- Flow: a buyer submits the form on /gift-cards (a form_submissions row of type
-- 'gift-card' with their crypto payment details). Staff check the payment on the
-- blockchain, then set that row's status to "confirmed" in the Table Editor.
-- That creates the gift cards (secret codes) and emails them. Clients redeem
-- a code in My World Bridge. Staff apply a card to a journey by adding a
-- negative row to gift_card_ledger.

create extension if not exists pgcrypto with schema extensions;

-- 1. The new form type.
alter table public.form_submissions drop constraint if exists form_submissions_form_type_check;
alter table public.form_submissions add constraint form_submissions_form_type_check
  check (form_type in ('contact', 'newsletter', 'journey-request', 'travel-details', 'gift-card'));

-- 2. Cards.
create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  submission_id uuid references public.form_submissions (id) on delete set null,
  amount_cents integer not null check (amount_cents between 50000 and 2500000),
  balance_cents integer not null check (balance_cents >= 0),
  currency text not null default 'USD',
  design text not null default 'classic',
  purchaser_name text,
  purchaser_email text not null,
  recipient_name text,
  recipient_email text not null,
  message text,
  status text not null default 'active' check (status in ('active', 'void')),
  owner_user_id uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.gift_cards enable row level security;
-- Customers can only read cards they have redeemed. Nobody can write directly.
create policy "Owners read their gift cards" on public.gift_cards
  for select to authenticated using (owner_user_id = auth.uid());

-- 3. Spend history. Staff add a negative row to use a card; the balance follows.
create table if not exists public.gift_card_ledger (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.gift_cards (id) on delete cascade,
  delta_cents integer not null check (delta_cents <> 0),
  note text,
  -- Optional: the client's request this spend belongs to (shown on their enquiry).
  submission_id uuid references public.form_submissions (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.gift_card_ledger enable row level security;
create policy "Owners read their gift card history" on public.gift_card_ledger
  for select to authenticated
  using (exists (select 1 from public.gift_cards c where c.id = card_id and c.owner_user_id = auth.uid()));

create or replace function public.apply_gift_card_ledger()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  update public.gift_cards set balance_cents = balance_cents + new.delta_cents
  where id = new.card_id and status = 'active';
  if not found then
    raise exception 'Gift card is not active';
  end if;
  return new;
end;
$fn$;
create trigger gift_card_ledger_apply before insert on public.gift_card_ledger
  for each row execute function public.apply_gift_card_ledger();

-- 4. Redemption attempts (brute-force protection). No policies: invisible to clients.
create table if not exists public.gift_card_attempts (
  id bigserial primary key,
  user_id uuid not null,
  ok boolean not null,
  at timestamptz not null default now()
);
alter table public.gift_card_attempts enable row level security;

-- 5. Codes look like  K7QM-2XPD-9TFH-4WNC  (31 symbols x 16 = ~79 bits).
create or replace function public.gen_gift_code()
returns text language plpgsql set search_path = public, extensions as $fn$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := gen_random_bytes(16);
  out text := '';
  i int;
begin
  for i in 0..15 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % 31) + 1, 1);
    if i in (3, 7, 11) then out := out || '-'; end if;
  end loop;
  return out;
end;
$fn$;

-- 6. Redeem a code into the signed-in customer's account.
create or replace function public.redeem_gift_card(p_code text)
returns table (ok boolean, message text, balance_cents integer)
language plpgsql security definer set search_path = public as $fn$
#variable_conflict use_column
declare
  uid uuid := auth.uid();
  norm text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  fails int;
  c public.gift_cards;
begin
  if uid is null then
    return query select false, 'Please sign in to redeem a gift card.', 0;
    return;
  end if;
  select count(*) into fails from public.gift_card_attempts
    where user_id = uid and ok = false and at > now() - interval '1 hour';
  if fails >= 8 then
    return query select false, 'Too many attempts. Please try again in an hour.', 0;
    return;
  end if;
  select * into c from public.gift_cards
    where replace(code, '-', '') = norm and status = 'active' for update;
  if not found or (c.owner_user_id is not null and c.owner_user_id <> uid) then
    insert into public.gift_card_attempts (user_id, ok) values (uid, false);
    return query select false, 'That code was not recognised. Check it and try again.', 0;
    return;
  end if;
  if c.owner_user_id is null then
    update public.gift_cards set owner_user_id = uid, claimed_at = now() where id = c.id;
  end if;
  insert into public.gift_card_attempts (user_id, ok) values (uid, true);
  return query select true, 'Gift card added to your account.', c.balance_cents;
end;
$fn$;
revoke all on function public.redeem_gift_card(text) from public, anon;
grant execute on function public.redeem_gift_card(text) to authenticated;

-- 7. Staff confirm payment (status -> confirmed) and the cards are created and emailed.
create or replace function public.issue_gift_cards()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare
  amt numeric; qty int; i int;
  api_key text; shared_secret text;
begin
  if new.form_type <> 'gift-card' or new.status <> 'confirmed' or old.status = 'confirmed' then
    return new;
  end if;
  if exists (select 1 from public.gift_cards where submission_id = new.id) then
    return new;
  end if;

  amt := nullif(new.payload ->> 'amount', '')::numeric;
  qty := nullif(new.payload ->> 'quantity', '')::int;
  if amt is null or qty is null or amt < 500 or qty < 1 or qty > 100 or amt * qty > 25000 then
    raise exception 'Gift card amount or quantity is out of range (500 to 25,000 USD in total). Check the payload.';
  end if;

  for i in 1..qty loop
    insert into public.gift_cards
      (code, submission_id, amount_cents, balance_cents, design,
       purchaser_name, purchaser_email, recipient_name, recipient_email, message)
    values
      (public.gen_gift_code(), new.id, (amt * 100)::int, (amt * 100)::int,
       coalesce(nullif(new.payload ->> 'design', ''), 'classic'),
       new.name, new.email,
       coalesce(nullif(new.payload ->> 'recipient_name', ''), new.name),
       lower(coalesce(nullif(new.payload ->> 'recipient_email', ''), new.email)),
       nullif(new.payload ->> 'gift_message', ''));
  end loop;

  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'notify_crypto_payment_key';
  select decrypted_secret into shared_secret from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';
  if api_key is null then
    raise warning 'notify_crypto_payment_key missing from Vault - gift cards created but not emailed for %', new.id;
    return new;
  end if;
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/deliver-gift-cards',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || api_key,
                                  'x-wbm-notify-secret', coalesce(shared_secret, '')),
    body := jsonb_build_object('submission_id', new.id)
  );
  return new;
end;
$fn$;
create trigger on_gift_card_paid after update of status on public.form_submissions
  for each row execute function public.issue_gift_cards();

-- 8. Gift card orders must not trigger the "journey confirmed" client email.
create or replace function public.notify_status_change()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare api_key text; shared_secret text;
begin
  if new.form_type in ('newsletter', 'gift-card') or new.status is not distinct from old.status then
    return new;
  end if;
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'notify_crypto_payment_key';
  select decrypted_secret into shared_secret from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';
  if api_key is null then
    raise warning 'notify_crypto_payment_key missing from Vault - status email skipped for %', new.id;
    return new;
  end if;
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/notify-status-change',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || api_key,
                                  'x-wbm-notify-secret', coalesce(shared_secret, '')),
    body := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$fn$;

-- 9. For consultants: every client's remaining gift card balance, by email.
-- Table Editor shows views too. Locked down so clients and the public cannot read it.
create or replace view public.client_gift_balances as
  select u.email, sum(c.balance_cents) / 100.0 as balance_usd, count(*) as cards
  from public.gift_cards c
  join auth.users u on u.id = c.owner_user_id
  where c.status = 'active'
  group by u.email;
revoke all on public.client_gift_balances from anon, authenticated;
