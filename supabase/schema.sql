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
