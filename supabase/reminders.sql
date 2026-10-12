-- Reminder emails, run hourly by pg_cron through the send-reminders Edge
-- Function (supabase/functions/send-reminders):
--   * clients who haven't replied 3 and 7 days after our last message,
--     document, invoice or stage change (two reminders at most);
--   * a daily list for admins of clients still unassigned after 24 hours.
-- reminder_log makes each reminder send once.

create extension if not exists pg_cron;

create table if not exists public.reminder_log (
  key text primary key,
  sent_at timestamptz not null default now()
);
alter table public.reminder_log enable row level security;
revoke all on public.reminder_log from anon, authenticated;

create or replace function public.run_reminders()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  api_key text;
  shared_secret text;
begin
  select decrypted_secret into api_key
  from vault.decrypted_secrets where name = 'notify_crypto_payment_key';
  select decrypted_secret into shared_secret
  from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';
  if api_key is null then
    raise warning 'notify_crypto_payment_key missing from Vault — reminders skipped';
    return;
  end if;
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key,
      'x-wbm-notify-secret', coalesce(shared_secret, '')
    ),
    body := '{}'::jsonb
  );
end;
$$;
revoke all on function public.run_reminders() from public, anon, authenticated;

select cron.unschedule('wbm-reminders') where exists (select 1 from cron.job where jobname = 'wbm-reminders');
select cron.schedule('wbm-reminders', '0 * * * *', 'select public.run_reminders()');
