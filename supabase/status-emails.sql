-- Emails the client when staff change a request's status in the Table Editor.
-- Safe to re-run. Uses the same Vault secrets as the form notification
-- (see forms.sql / hardening.sql). Deploy the edge function first:
--   supabase/functions/notify-status-change  (verify_jwt: true)

create or replace function public.notify_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  api_key text;
  shared_secret text;
begin
  -- Newsletter sign-ups have no request to follow; same-status saves are ignored.
  if new.form_type = 'newsletter' or new.status is not distinct from old.status then
    return new;
  end if;

  select decrypted_secret into api_key
  from vault.decrypted_secrets where name = 'notify_crypto_payment_key';

  select decrypted_secret into shared_secret
  from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';

  -- A missing key must never block staff from saving the status change.
  if api_key is null then
    raise warning 'notify_crypto_payment_key missing from Vault — status email skipped for %', new.id;
    return new;
  end if;

  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/notify-status-change',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key,
      'x-wbm-notify-secret', coalesce(shared_secret, '')
    ),
    body := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$;

drop trigger if exists on_status_changed on public.form_submissions;
create trigger on_status_changed
  after update of status on public.form_submissions
  for each row execute function public.notify_status_change();
