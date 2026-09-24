-- World Bridge Meridian — saved journeys table.
-- Run this once in the Supabase dashboard: SQL Editor -> New Query -> paste -> Run,
-- then run hardening.sql (abuse controls + Vault-based notification credentials).

create table if not exists public.saved_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  slug text not null,
  title text not null,
  image text not null,
  href text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, type, slug)
);

alter table public.saved_journeys enable row level security;

-- Every visitor can only ever see or change their own saved journeys.
create policy "Users manage their own saved journeys"
  on public.saved_journeys
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Full name + phone captured at sign-up (auth.users only stores email by
-- default). Populated automatically by the trigger below — never written
-- to directly by the site.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- handle_new_user() is SECURITY DEFINER for the trigger's sake only — it
-- must never be callable directly over the API (that would let anyone
-- insert an arbitrary profiles row for any user id).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Crypto payment references submitted from /payments (wallet addresses
-- confirmed by WBM, see src/data/cryptoPayments.ts). Verification is
-- manual, staff-only, done in the Supabase dashboard — a submitted
-- transaction hash is never treated as confirmed automatically.
create table if not exists public.crypto_payment_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  asset text not null,
  network text not null,
  wallet_address text not null,
  transaction_hash text not null,
  payer_name text,
  payer_email text,
  lead_id text,
  notes text,
  status text not null default 'pending_verification'
    check (status in ('awaiting_payment','payment_submitted','pending_verification','verified','rejected','expired')),
  verified_at timestamptz,
  verified_by text
);

alter table public.crypto_payment_submissions enable row level security;

-- Visitors can submit a payment reference, but can never read submissions
-- back out (no anon SELECT policy) — verification is staff-only, done in
-- the Supabase dashboard with the service role, never automatically.
create policy "Anyone can submit a payment reference"
  on public.crypto_payment_submissions
  for insert
  to anon
  with check (true);

-- On every submission: notify WBM staff (this is the "routed to our team"
-- step, since there's no separate ticketing system) and send the customer
-- a receipt-of-submission email (never a payment receipt — nothing is
-- verified yet). Handled by the notify-crypto-payment Edge Function.
--
-- The version below is a placeholder that cannot authenticate — it exists
-- so the trigger is in place; hardening.sql replaces it with one that
-- reads real credentials from Vault. Run that file too, or notifications
-- 401 silently.
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_crypto_payment_submission()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/notify-crypto-payment',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || '<NEXT_PUBLIC_SUPABASE_ANON_KEY>'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists on_crypto_payment_submitted on public.crypto_payment_submissions;

create trigger on_crypto_payment_submitted
  after insert on public.crypto_payment_submissions
  for each row execute procedure public.notify_crypto_payment_submission();

revoke execute on function public.notify_crypto_payment_submission() from public, anon, authenticated;
