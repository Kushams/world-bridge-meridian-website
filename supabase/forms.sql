-- Form backend: contact, newsletter and journey-request submissions.
--
-- Replaces Netlify Forms, which only works while the site is served by
-- Netlify. Every submission lands in this table (durable, exportable) and
-- fires an email to the team through the notify-form-submission edge
-- function, exactly like crypto_payment_submissions does for payments.
--
-- Run once in the Supabase SQL editor. Requires the two Vault secrets
-- created by hardening.sql (notify_crypto_payment_key / _secret), which
-- are the anon key and the shared secret both edge functions check.

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('contact', 'newsletter', 'journey-request')),
  name text,
  email text not null,
  subject text,
  message text,
  -- Everything else the form collected. The journey wizard has ~25
  -- fields and will grow; columns for each would be churn for no gain,
  -- since nothing queries them individually.
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index if not exists form_submissions_submitted_at_idx
  on public.form_submissions (submitted_at desc);

alter table public.form_submissions enable row level security;

-- Visitors are anonymous by definition, so anon may insert — and nothing
-- more. Reading submissions is staff work, done with the service role
-- (the dashboard's table editor).
drop policy if exists "Anyone can submit a form" on public.form_submissions;
create policy "Anyone can submit a form"
  on public.form_submissions for insert
  to anon, authenticated
  with check (true);

-- Abuse control: the anon key is public, so the insert endpoint is open
-- to anyone who reads the site's JS. Same shape as the crypto throttle.
create or replace function public.throttle_form_submission()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recent_total int;
  recent_from_sender int;
begin
  select count(*) into recent_total
  from public.form_submissions
  where submitted_at > now() - interval '1 minute';

  if recent_total >= 30 then
    raise exception 'We are receiving a lot of messages right now. Please try again in a minute.'
      using errcode = '53400';
  end if;

  select count(*) into recent_from_sender
  from public.form_submissions
  where lower(email) = lower(new.email)
    and submitted_at > now() - interval '10 minutes';

  if recent_from_sender >= 5 then
    raise exception 'We already have your message and will reply shortly — no need to resend.'
      using errcode = '53400';
  end if;

  return new;
end;
$$;

revoke all on function public.throttle_form_submission() from public, anon, authenticated;

drop trigger if exists throttle_form_submitted on public.form_submissions;
create trigger throttle_form_submitted
  before insert on public.form_submissions
  for each row execute function public.throttle_form_submission();

-- Email notification. A missing Vault key must never cost us the
-- submission: the row is already saved, so warn and carry on.
create or replace function public.notify_form_submission()
returns trigger
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
    raise warning 'notify_crypto_payment_key missing from Vault — form notification skipped for %', new.id;
    return new;
  end if;

  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/notify-form-submission',
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

drop trigger if exists on_form_submitted on public.form_submissions;
create trigger on_form_submitted
  after insert on public.form_submissions
  for each row execute function public.notify_form_submission();
