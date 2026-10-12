-- Who on the team is online, visible to admins only. Safe to re-run.
--
-- Each signed-in staff member's browser calls staff_ping() about once a minute while the staff page is open and visible.
-- Admins read staff_presence(): online = pinged in the last 2 minutes. Staff cannot read it.

create table if not exists public.staff_presence (
  email text primary key,
  last_seen timestamptz not null default now()
);
alter table public.staff_presence enable row level security;
revoke all on public.staff_presence from anon, authenticated;

create or replace function public.staff_ping()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
begin
  if me is null or not public.is_staff() then
    raise exception 'Staff only';
  end if;
  insert into public.staff_presence (email, last_seen) values (me, now())
  on conflict (email) do update set last_seen = now();
end;
$$;
revoke all on function public.staff_ping() from public, anon;
grant execute on function public.staff_ping() to authenticated;

drop function if exists public.staff_presence();
create function public.staff_presence()
returns table (email text, last_seen timestamptz, online boolean)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
    select s.email, p.last_seen, coalesce(p.last_seen > now() - interval '2 minutes', false)
    from public.staff_members s
    left join public.staff_presence p on p.email = s.email;
end;
$$;
revoke all on function public.staff_presence() from public, anon;
grant execute on function public.staff_presence() to authenticated;
