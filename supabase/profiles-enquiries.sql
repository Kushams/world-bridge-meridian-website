-- Customer profiles + "My enquiries".
--
-- 1. profiles gains the non-sensitive details a traveler would otherwise
--    retype on every form (home city, nationality, preferences). Passport
--    numbers are deliberately NOT stored here.
-- 2. form_submissions gains a staff-managed status (a dropdown in the
--    Supabase Table Editor) and signed-in customers can read their OWN
--    enquiries, matched on their verified email address.
--
-- Run once in the Supabase SQL editor (or via a migration). Safe to re-run.

alter table public.profiles
  add column if not exists home_city text,
  add column if not exists nationality text,
  add column if not exists preferred_contact text,
  add column if not exists travel_styles text[] not null default '{}',
  add column if not exists interests text[] not null default '{}',
  add column if not exists travel_pace text,
  add column if not exists bed_preference text,
  add column if not exists dietary_requirements text,
  add column if not exists allergies text,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();

-- Staff-managed enquiry stage. An enum shows up as a dropdown in the
-- Table Editor, so changing it is one click on the row.
do $$
begin
  create type public.enquiry_status as enum
    ('received', 'in_review', 'proposal_sent', 'confirmed', 'closed');
exception
  when duplicate_object then null;
end
$$;

alter table public.form_submissions
  add column if not exists status public.enquiry_status not null default 'received',
  add column if not exists status_updated_at timestamptz not null default now();

create or replace function public.touch_enquiry_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists form_submissions_touch_status on public.form_submissions;
create trigger form_submissions_touch_status
  before update on public.form_submissions
  for each row execute function public.touch_enquiry_status();

-- The signed-in user's email, only if they have confirmed it. Without the
-- confirmation check, anyone could register someone else's address and
-- read that person's enquiries.
create or replace function public.verified_email()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select lower(email)
  from auth.users
  where id = auth.uid() and email_confirmed_at is not null
$$;

revoke all on function public.verified_email() from public, anon;
grant execute on function public.verified_email() to authenticated;

drop policy if exists "Customers read their own enquiries" on public.form_submissions;
create policy "Customers read their own enquiries"
  on public.form_submissions for select
  to authenticated
  using (
    form_type <> 'newsletter'
    and lower(email) = public.verified_email()
  );
