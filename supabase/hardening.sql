-- World Bridge Meridian — abuse controls for anonymous payment submissions.
-- Run once in the Supabase dashboard (SQL Editor) after schema.sql.
--
-- Context: /payments accepts submissions from visitors who are not signed
-- in, so the only credential involved is the anon key, which is public by
-- design (it ships in the site's JS bundle). Without the controls below,
-- anyone can replay that endpoint in a loop and bury real submissions
-- under fake staff notifications.

-- 1. One transaction hash = one payment. Kills replays and the
--    double-click double-submit at the same time.
create unique index if not exists crypto_payment_submissions_tx_hash_key
  on public.crypto_payment_submissions (lower(transaction_hash));

-- 2. Rate limits. SECURITY DEFINER because anon has no SELECT on this
--    table (and must not get one) — the counting happens as the owner.
create or replace function public.throttle_crypto_payment_submission()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recent_total int;
  recent_from_payer int;
begin
  select count(*) into recent_total
  from public.crypto_payment_submissions
  where submitted_at > now() - interval '1 minute';

  if recent_total >= 20 then
    raise exception 'Too many payment references submitted right now. Please try again in a minute.'
      using errcode = '53400';
  end if;

  if new.payer_email is not null then
    select count(*) into recent_from_payer
    from public.crypto_payment_submissions
    where lower(payer_email) = lower(new.payer_email)
      and submitted_at > now() - interval '10 minutes';

    if recent_from_payer >= 3 then
      raise exception 'You have already submitted several references. Our team is reviewing them — please contact us instead of resubmitting.'
        using errcode = '53400';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists throttle_crypto_payment_submitted on public.crypto_payment_submissions;

create trigger throttle_crypto_payment_submitted
  before insert on public.crypto_payment_submissions
  for each row execute procedure public.throttle_crypto_payment_submission();

revoke execute on function public.throttle_crypto_payment_submission() from public, anon, authenticated;

-- 3. Notification credentials move into Vault, so this file never carries
--    a key and the trigger can't silently 401 on a placeholder.
--
--    Run these two once, substituting real values:
--
--      select vault.create_secret('<anon key>',       'notify_crypto_payment_key');
--      select vault.create_secret('<long random str>', 'notify_crypto_payment_secret');
--
--    Then set the same random string as the NOTIFY_SHARED_SECRET secret on
--    the notify-crypto-payment Edge Function and have it reject any request
--    whose x-wbm-notify-secret header doesn't match. A valid anon key alone
--    is not proof of anything — it's public.
create extension if not exists supabase_vault with schema vault;

create or replace function public.notify_crypto_payment_submission()
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
    raise warning 'notify_crypto_payment_key missing from Vault — staff notification skipped for submission %', new.id;
    return new;
  end if;

  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/notify-crypto-payment',
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

revoke execute on function public.notify_crypto_payment_submission() from public, anon, authenticated;
