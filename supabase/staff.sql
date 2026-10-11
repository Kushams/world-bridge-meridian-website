-- Staff page (/staff): lets listed staff manage requests, client documents and
-- invoices from the website instead of the Supabase dashboard. Safe to re-run.
--
-- Who is staff: rows in public.staff_members (email, lower case). A person is
-- staff only while signed in with that CONFIRMED email (public.verified_email()).
-- Add someone:     insert into public.staff_members (email) values ('name@example.com');
-- Remove someone:  delete from public.staff_members where email = 'name@example.com';
--
-- Staff can READ requests, invoices and client files, ADD/REMOVE files in
-- client-documents, and change data only through the staff_* functions below
-- (status changes, creating/cancelling invoices), each of which re-checks is_staff().

create table if not exists public.staff_members (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.staff_members enable row level security;
revoke all on public.staff_members from anon, authenticated;

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

-- Read access for staff.
drop policy if exists "Staff read all requests" on public.form_submissions;
create policy "Staff read all requests" on public.form_submissions
  for select to authenticated using (public.is_staff());

drop policy if exists "Staff read all invoices" on public.invoices;
create policy "Staff read all invoices" on public.invoices
  for select to authenticated using (public.is_staff());

drop policy if exists "Staff read all signatures" on public.document_signatures;
create policy "Staff read all signatures" on public.document_signatures
  for select to authenticated using (public.is_staff());

-- Client files.
drop policy if exists "Staff read client documents" on storage.objects;
create policy "Staff read client documents" on storage.objects
  for select to authenticated using (bucket_id = 'client-documents' and public.is_staff());

drop policy if exists "Staff add client documents" on storage.objects;
create policy "Staff add client documents" on storage.objects
  for insert to authenticated with check (bucket_id = 'client-documents' and public.is_staff());

drop policy if exists "Staff remove client documents" on storage.objects;
create policy "Staff remove client documents" on storage.objects
  for delete to authenticated using (bucket_id = 'client-documents' and public.is_staff());

drop policy if exists "Staff read client uploads" on storage.objects;
create policy "Staff read client uploads" on storage.objects
  for select to authenticated using (bucket_id = 'client-uploads' and public.is_staff());

-- Accounts (the client list) and their profiles.
drop policy if exists "Staff read all profiles" on public.profiles;
create policy "Staff read all profiles" on public.profiles
  for select to authenticated using (public.is_staff());

drop function if exists public.staff_list_clients();
create function public.staff_list_clients()
returns table (id uuid, email text, full_name text, phone text, avatar_url text, created_at timestamptz, confirmed boolean)
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
    select u.id, lower(u.email)::text, p.full_name, p.phone, p.avatar_url, u.created_at, u.email_confirmed_at is not null
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.email is not null
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
  if not public.is_staff() then
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
  if not public.is_staff() then
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
  update public.invoices set status = 'void' where id = p_id and status = 'unpaid' and kind = 'invoice';
end;
$$;
revoke all on function public.staff_void_invoice(uuid) from public, anon;
grant execute on function public.staff_void_invoice(uuid) to authenticated;
