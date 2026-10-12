-- Per-client controls used from the staff page (staff-client-action Edge
-- Function): stop automatic reminders, and block (pause) an account. Blocking
-- also bans the auth user, so they can't sign in until unblocked. Rows are
-- written only by the Edge Function (service role); staff read the rows for
-- the clients they can see.

create table if not exists public.client_flags (
  client_email text primary key check (client_email = lower(client_email)),
  reminders_off boolean not null default false,
  blocked boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);
alter table public.client_flags enable row level security;
revoke all on public.client_flags from anon, authenticated;
grant select on public.client_flags to authenticated;

drop policy if exists "Staff read flags of their clients" on public.client_flags;
create policy "Staff read flags of their clients" on public.client_flags
  for select to authenticated using (public.staff_can_see(client_email));
