-- Real push notifications for the staff page. Safe to re-run.
--
-- push_config: one row holding this site's Web Push (VAPID) key pair. The edge function creates it on first use.
--   The private key never leaves the database: RLS is on and nobody (anon or signed in) has table grants,
--   so only edge functions running with the service role can read it.
-- push_subscriptions: one row per staff device that turned notifications on.
create table if not exists public.push_config (
  id int primary key check (id = 1),
  public_key text not null,
  private_key text not null,
  created_at timestamptz not null default now()
);
alter table public.push_config enable row level security;
revoke all on public.push_config from anon, authenticated;

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  email text not null check (email = lower(email)),
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_email_idx on public.push_subscriptions (email);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
