-- Run AFTER the site build that sends payment references through the submit-form function is
-- live (it needs NEXT_PUBLIC_TURNSTILE_SITE_KEY set). Removes the direct "anyone can insert"
-- route so every payment reference must pass the Cloudflare Turnstile check.
drop policy if exists "Anyone can submit a payment reference" on public.crypto_payment_submissions;
revoke insert on public.crypto_payment_submissions from anon, authenticated;
