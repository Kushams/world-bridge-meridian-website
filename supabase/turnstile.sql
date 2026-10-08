-- Apply after the submit-form edge function is deployed with
-- TURNSTILE_SECRET_KEY set and the site is built with
-- NEXT_PUBLIC_TURNSTILE_SITE_KEY. From then on every form submission must
-- carry a valid Turnstile token: the edge function verifies it and inserts
-- with the service role, so anon no longer needs (or gets) insert access.
drop policy if exists "Anyone can submit a form" on public.form_submissions;
