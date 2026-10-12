-- Staff page (/staff): lets listed staff manage requests, client documents and
-- invoices from the website instead of the Supabase dashboard. Safe to re-run.
--
-- Who is staff: rows in public.staff_members (email, lower case). A person is
-- staff only while signed in with that CONFIRMED email (public.verified_email()).
--   role 'admin': sees and manages every client.
--   role 'staff': sees only clients assigned to them in public.client_assignments,
--                 either automatically (the client arrived via ?from=<link_code>)
--                 or by an admin from the staff page.
-- Add an admin:  insert into public.staff_members (email, role, name) values ('name@example.com', 'admin', 'Name');
-- Add staff:     insert into public.staff_members (email, role, name, link_code) values ('name@example.com', 'staff', 'Name', 'name');
-- Remove:        delete from public.staff_members where email = 'name@example.com';
--
-- Staff can READ requests, invoices and files of the clients they can see, ADD/REMOVE
-- files in those clients' client-documents folders, and change data only through
-- the staff_* functions below, each of which re-checks access.

create table if not exists public.staff_members (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.staff_members add column if not exists role text not null default 'staff' check (role in ('admin', 'staff'));
alter table public.staff_members add column if not exists name text;
alter table public.staff_members add column if not exists link_code text unique check (link_code ~ '^[a-z0-9-]{2,30}$');
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;

create table if not exists public.client_assignments (
  client_email text primary key check (client_email = lower(client_email)),
  staff_email text not null references public.staff_members (email) on delete cascade on update cascade,
  source text not null default 'manual' check (source in ('link', 'manual')),
  assigned_at timestamptz not null default now()
);
alter table public.client_assignments enable row level security;
revoke all on public.client_assignments from anon, authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (select 1 from public.staff_members s where s.email = public.verified_email())
$$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (select 1 from public.staff_members s where s.email = public.verified_email() and s.role = 'admin')
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Admins see every client; other staff only the clients assigned to them.
create or replace function public.staff_can_see(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_admin() or exists (
    select 1 from public.client_assignments a
    where a.client_email = lower(p_email) and a.staff_email = public.verified_email()
  )
$$;
revoke all on function public.staff_can_see(text) from public, anon;
grant execute on function public.staff_can_see(text) to authenticated;

create or replace function public.staff_can_see_user(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.staff_can_see((select u.email from auth.users u where u.id = p_user))
$$;
revoke all on function public.staff_can_see_user(uuid) from public, anon;
grant execute on function public.staff_can_see_user(uuid) to authenticated;

-- The signed-in staff member (no row for non-staff).
create or replace function public.staff_me()
returns table (email text, role text, name text, link_code text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select s.email, s.role, s.name, s.link_code from public.staff_members s where s.email = public.verified_email()
$$;
revoke all on function public.staff_me() from public, anon;
grant execute on function public.staff_me() to authenticated;

drop function if exists public.staff_team();
create function public.staff_team()
returns table (email text, role text, name text, link_code text, clients bigint)
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
    select s.email, s.role, s.name, s.link_code,
      (select count(*) from public.client_assignments a where a.staff_email = s.email)
    from public.staff_members s
    order by s.role, coalesce(s.name, s.email);
end;
$$;
revoke all on function public.staff_team() from public, anon;
grant execute on function public.staff_team() to authenticated;

-- Admins move a client to a staff member (p_staff_email null = unassigned, admins only).
create or replace function public.staff_assign(p_client_email text, p_staff_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  if p_staff_email is null or p_staff_email = '' then
    delete from public.client_assignments where client_email = lower(trim(p_client_email));
  else
    insert into public.client_assignments (client_email, staff_email, source)
    values (lower(trim(p_client_email)), lower(trim(p_staff_email)), 'manual')
    on conflict (client_email) do update set staff_email = excluded.staff_email, source = 'manual', assigned_at = now();
  end if;
end;
$$;
revoke all on function public.staff_assign(text, text) from public, anon;
grant execute on function public.staff_assign(text, text) to authenticated;

-- Called by the website for a signed-in client who arrived through a staff
-- member's personal link. Only ever assigns the caller's own email, and never
-- overrides an existing assignment.
create or replace function public.claim_staff_referral(p_code text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
  owner text;
begin
  if me is null or exists (select 1 from public.staff_members where email = me) then
    return;
  end if;
  select s.email into owner from public.staff_members s where s.link_code = lower(trim(coalesce(p_code, '')));
  if owner is null then
    return;
  end if;
  insert into public.client_assignments (client_email, staff_email, source)
  values (me, owner, 'link')
  on conflict (client_email) do nothing;
end;
$$;
revoke all on function public.claim_staff_referral(text) from public, anon;
grant execute on function public.claim_staff_referral(text) to authenticated;

-- Read access for staff.
drop policy if exists "Staff read all requests" on public.form_submissions;
create policy "Staff read all requests" on public.form_submissions
  for select to authenticated using (public.staff_can_see(email));

drop policy if exists "Staff read all invoices" on public.invoices;
create policy "Staff read all invoices" on public.invoices
  for select to authenticated using (public.staff_can_see_user(user_id));

drop policy if exists "Staff read all signatures" on public.document_signatures;
create policy "Staff read all signatures" on public.document_signatures
  for select to authenticated using (public.staff_can_see(client_email));

-- Client files.
drop policy if exists "Staff read client documents" on storage.objects;
create policy "Staff read client documents" on storage.objects
  for select to authenticated using (bucket_id = 'client-documents' and public.staff_can_see((storage.foldername(name))[1]));

drop policy if exists "Staff add client documents" on storage.objects;
create policy "Staff add client documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'client-documents' and public.staff_can_see((storage.foldername(name))[1]));

drop policy if exists "Staff remove client documents" on storage.objects;
create policy "Staff remove client documents" on storage.objects
  for delete to authenticated using (bucket_id = 'client-documents' and public.staff_can_see((storage.foldername(name))[1]));

drop policy if exists "Staff read client uploads" on storage.objects;
create policy "Staff read client uploads" on storage.objects
  for select to authenticated using (bucket_id = 'client-uploads' and public.staff_can_see((storage.foldername(name))[1]));

-- Accounts (the client list) and their profiles.
drop policy if exists "Staff read all profiles" on public.profiles;
create policy "Staff read all profiles" on public.profiles
  for select to authenticated using (public.staff_can_see_user(id));

drop function if exists public.staff_list_clients();
create function public.staff_list_clients()
returns table (id uuid, email text, full_name text, phone text, avatar_url text, created_at timestamptz, confirmed boolean, assigned_to text)
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
    select u.id, lower(u.email)::text, p.full_name, p.phone, p.avatar_url, u.created_at, u.email_confirmed_at is not null, a.staff_email
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.client_assignments a on a.client_email = lower(u.email)
    where u.email is not null
      and public.staff_can_see(u.email)
      and not exists (select 1 from public.staff_members s where s.email = lower(u.email))
    order by u.created_at desc;
end;
$$;
revoke all on function public.staff_list_clients() from public, anon;
grant execute on function public.staff_list_clients() to authenticated;

-- Change a request's stage (the client is emailed by the on_status_changed trigger).
create or replace function public.staff_set_status(p_id uuid, p_status public.enquiry_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.form_submissions f where f.id = p_id and public.staff_can_see(f.email)) then
    raise exception 'Staff only';
  end if;
  update public.form_submissions set status = p_status where id = p_id;
end;
$$;
revoke all on function public.staff_set_status(uuid, public.enquiry_status) from public, anon;
grant execute on function public.staff_set_status(uuid, public.enquiry_status) to authenticated;

create or replace function public.staff_create_invoice(p_email text, p_amount numeric, p_description text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() or not public.staff_can_see(p_email) then
    raise exception 'Staff only';
  end if;
  return public.create_invoice(p_email, p_amount, p_description);
end;
$$;
revoke all on function public.staff_create_invoice(text, numeric, text) from public, anon;
grant execute on function public.staff_create_invoice(text, numeric, text) to authenticated;

create or replace function public.staff_void_invoice(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  update public.invoices set status = 'void'
  where id = p_id and status = 'unpaid' and kind = 'invoice' and public.staff_can_see_user(user_id);
end;
$$;
revoke all on function public.staff_void_invoice(uuid) from public, anon;
grant execute on function public.staff_void_invoice(uuid) to authenticated;
