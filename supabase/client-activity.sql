-- Two more things clients do that staff hear about: opening an invoice, and starting a card payment (finished or not).
-- Run once in the Supabase SQL editor (after push-triggers.sql). Safe to re-run.
--   * invoices.first_opened_at / last_opened_at: set when the client opens the Invoices tab with an unpaid invoice.
--   * invoices.card_started_at: set automatically whenever a card payment session is created for the invoice.
--   * push + email to the team on both (via the push-notify edge function); the hourly send-reminders function emails
--     the client if a card payment was started but not finished.

alter table public.invoices add column if not exists first_opened_at timestamptz;
alter table public.invoices add column if not exists last_opened_at timestamptz;
alter table public.invoices add column if not exists card_started_at timestamptz;

-- push_notify now also says which trigger fired, so push-notify can tell the invoice events apart.
create or replace function public.push_notify()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  api_key text;
  shared_secret text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'notify_crypto_payment_key';
  select decrypted_secret into shared_secret from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';
  if api_key is null then
    return new;
  end if;
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/push-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key,
      'x-wbm-notify-secret', coalesce(shared_secret, '')
    ),
    body := jsonb_build_object('table', tg_table_name, 'op', tg_op, 'trigger', tg_name, 'record', to_jsonb(new))
  );
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.push_notify() from public, anon, authenticated;

-- A card payment session was created: remember when (the card functions set card_reference).
create or replace function public.invoices_track_card_start()
returns trigger
language plpgsql
as $$
begin
  if new.card_reference is not null and new.card_reference is distinct from old.card_reference then
    new.card_started_at := now();
  end if;
  return new;
end;
$$;

create or replace trigger invoices_card_start
  before update of card_reference on public.invoices
  for each row
  execute function public.invoices_track_card_start();

-- The client opened their Invoices tab: stamp each unpaid invoice (only the client's own).
create or replace function public.client_opened_invoice(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invoices
  set last_opened_at = now(), first_opened_at = coalesce(first_opened_at, now())
  where id = p_id and user_id = auth.uid() and kind = 'invoice' and status = 'unpaid';
end;
$$;
revoke all on function public.client_opened_invoice(uuid) from public, anon;
grant execute on function public.client_opened_invoice(uuid) to authenticated;

create or replace trigger push_on_invoice_opened
  after update of first_opened_at on public.invoices
  for each row
  when (old.first_opened_at is null and new.first_opened_at is not null)
  execute function public.push_notify();

create or replace trigger push_on_card_started
  after update of card_started_at on public.invoices
  for each row
  when (new.card_started_at is not null and new.status = 'unpaid')
  execute function public.push_notify();

-- Sign-ins: every time a client signs in (at most one record an hour; staff sign-ins are not recorded) we keep a row,
-- staff see "last signed in" on the client's page, and the team (admins + the staff member looking after the client) gets push + email.
create table if not exists public.client_sign_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  signed_in_at timestamptz not null default now()
);
create index if not exists client_sign_ins_user_idx on public.client_sign_ins (user_id, signed_in_at desc);
alter table public.client_sign_ins enable row level security;
revoke all on public.client_sign_ins from anon, authenticated;
grant select on public.client_sign_ins to authenticated;
drop policy if exists "Staff read their clients sign-ins" on public.client_sign_ins;
create policy "Staff read their clients sign-ins" on public.client_sign_ins for select to authenticated using (public.staff_can_see_user(user_id));

create or replace function public.record_client_sign_in()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.last_sign_in_at is not null and new.last_sign_in_at is distinct from old.last_sign_in_at
     and not exists (select 1 from public.staff_members s where lower(s.email) = lower(new.email))
     and not exists (select 1 from public.client_sign_ins c where c.user_id = new.id and c.signed_in_at > new.last_sign_in_at - interval '1 hour') then
    insert into public.client_sign_ins (user_id, signed_in_at) values (new.id, new.last_sign_in_at);
  end if;
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.record_client_sign_in() from public, anon, authenticated;

create or replace trigger record_client_sign_in
  after update of last_sign_in_at on auth.users
  for each row
  execute function public.record_client_sign_in();

create or replace trigger push_on_sign_in
  after insert on public.client_sign_ins
  for each row
  execute function public.push_notify();
