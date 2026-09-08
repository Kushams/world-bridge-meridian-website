-- World Bridge Meridian — saved journeys table.
-- Run this once in the Supabase dashboard: SQL Editor -> New Query -> paste -> Run.

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
