-- A limited team list for staff (non-admins). Safe to re-run.
--
-- Staff see the company account (shown as "World Bridge Meridian") and the other staff members.
-- They do NOT see other admins, how many clients anyone has, or anyone's personal link.
-- Admins keep using staff_team(), which is unchanged.

drop function if exists public.staff_team_directory();
create function public.staff_team_directory()
returns table (email text, role text, name text, title text)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  return query
    select s.email, s.role,
      case when s.email = 'info@worldbridgemeridian.group' then 'World Bridge Meridian' else s.name end,
      s.title
    from public.staff_members s
    where s.role = 'staff' or s.email = 'info@worldbridgemeridian.group'
    order by (s.role = 'staff'), coalesce(s.name, s.email);
end;
$$;
revoke all on function public.staff_team_directory() from public, anon;
grant execute on function public.staff_team_directory() to authenticated;
