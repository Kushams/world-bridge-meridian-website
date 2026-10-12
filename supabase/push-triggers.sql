-- Database triggers that fire a push notification (via the push-notify edge function) when a client messages or uploads,
-- a new request arrives, a payment lands or needs checking, or a crypto payment reference is submitted.
-- Safe to re-run. A missing Vault key or a failed call never blocks the original insert or update.
--
-- Uses the same Vault secrets as the other notify triggers (notify_crypto_payment_key / notify_crypto_payment_secret).

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
    body := jsonb_build_object('table', tg_table_name, 'op', tg_op, 'record', to_jsonb(new))
  );
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.push_notify() from public, anon, authenticated;

create or replace trigger push_on_client_message
  after insert on public.client_messages
  for each row
  when (new.sender = 'client' or new.kind in ('upload', 'signed', 'returned'))
  execute function public.push_notify();

create or replace trigger push_on_request
  after insert on public.form_submissions
  for each row
  when (new.form_type <> 'newsletter')
  execute function public.push_notify();

create or replace trigger push_on_payment
  after update of status on public.invoices
  for each row
  when (new.status in ('paid', 'needs_review') and old.status is distinct from new.status and new.paid_via is distinct from 'bank transfer')
  execute function public.push_notify();

create or replace trigger push_on_crypto_payment
  after insert on public.crypto_payment_submissions
  for each row
  execute function public.push_notify();

-- More client activity: a new account, a saved journey, Travel Credits spent, a gift card redeemed.
-- (push-notify also emails the team for these, because nothing else does.)
create or replace trigger push_on_new_profile
  after insert on public.profiles
  for each row
  execute function public.push_notify();

create or replace trigger push_on_saved_journey
  after insert on public.saved_journeys
  for each row
  execute function public.push_notify();

create or replace trigger push_on_credits_used
  after insert on public.travel_credit_ledger
  for each row
  when (new.delta_cents < 0)
  execute function public.push_notify();

create or replace trigger push_on_gift_card_redeemed
  after update of claimed_at on public.gift_cards
  for each row
  when (old.claimed_at is null and new.claimed_at is not null)
  execute function public.push_notify();
