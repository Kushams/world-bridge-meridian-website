-- Travel Authorisation Form: "fill in and sign on screen".
--
-- Staff send a request (exhibition, destination, who covers costs, their own signature line).
-- The client opens it, checks and corrects their details, signs on screen, and the site creates the signed PDF.
-- Correcting a detail also updates the client's profile (name, phone, nationality: the only
-- travel details the profile holds; passport numbers are deliberately never stored there).
--
-- Run once in the Supabase SQL editor. Safe to re-run: tables use "if not exists", functions "create or replace",
-- and the policies are dropped and re-created.
-- Needs supabase/staff.sql, client-uploads-signing.sql and profiles-enquiries.sql to have been run first.

-- A staff member's saved signature image (PNG data URL), placed on forms they send. Private to that staff member.
create table if not exists public.staff_signatures (
  email text primary key references public.staff_members (email) on delete cascade on update cascade,
  signature text not null check (length(signature) < 400000 and signature like 'data:image/png;base64,%'),
  updated_at timestamptz not null default now()
);
alter table public.staff_signatures enable row level security;

drop policy if exists "Staff manage their own signature" on public.staff_signatures;
create policy "Staff manage their own signature" on public.staff_signatures
  for all to authenticated
  using (public.is_staff() and email = public.verified_email())
  with check (public.is_staff() and email = public.verified_email());

-- One row per form sent. Written only by the functions below, never directly from the browser.
create table if not exists public.travel_auth_requests (
  id uuid primary key default gen_random_uuid(),
  client_email text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  exhibition text not null default '',
  destination_kind text not null check (destination_kind in ('uk', 'other')),
  destination text not null,
  covered_by text not null,
  purpose text not null default '',
  signer_name text not null,
  signer_title text not null,
  signer_signature text,
  prefill jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'signed', 'void')),
  signed_values jsonb,
  signed_at timestamptz,
  document_path text
);
create index if not exists travel_auth_requests_client_idx on public.travel_auth_requests (lower(client_email));
alter table public.travel_auth_requests enable row level security;

drop policy if exists "Clients read their own travel forms" on public.travel_auth_requests;
create policy "Clients read their own travel forms" on public.travel_auth_requests
  for select to authenticated using (lower(client_email) = public.verified_email());

drop policy if exists "Staff read travel forms" on public.travel_auth_requests;
create policy "Staff read travel forms" on public.travel_auth_requests
  for select to authenticated using (public.is_staff() and public.staff_can_see(client_email));

-- Staff: send a form. The signature comes from the sender's own saved signature, never from the browser's request.
create or replace function public.staff_create_travel_auth(
  p_email text,
  p_exhibition text,
  p_kind text,
  p_destination text,
  p_covered_by text,
  p_purpose text,
  p_signer_name text,
  p_signer_title text,
  p_prefill jsonb
) returns uuid
language plpgsql
security definer
set search_path = public, auth
as $fn$
declare
  v_id uuid;
  v_sig text;
begin
  if not public.is_staff() or not public.staff_can_see(p_email) then
    raise exception 'Not allowed';
  end if;
  if p_kind not in ('uk', 'other') or coalesce(trim(p_destination), '') = '' then
    raise exception 'Destination required';
  end if;
  select signature into v_sig from public.staff_signatures where email = public.verified_email();
  insert into public.travel_auth_requests
    (client_email, created_by, exhibition, destination_kind, destination, covered_by, purpose, signer_name, signer_title, signer_signature, prefill)
  values
    (lower(trim(p_email)), public.verified_email(), left(coalesce(p_exhibition, ''), 300), p_kind, left(trim(p_destination), 200), left(coalesce(p_covered_by, ''), 200),
     left(coalesce(p_purpose, ''), 400), left(p_signer_name, 120), left(p_signer_title, 120), v_sig, coalesce(p_prefill, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$fn$;
revoke all on function public.staff_create_travel_auth(text, text, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.staff_create_travel_auth(text, text, text, text, text, text, text, text, jsonb) to authenticated;

-- Staff: cancel a form that hasn't been signed yet.
create or replace function public.staff_void_travel_auth(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $fn$
begin
  update public.travel_auth_requests
     set status = 'void'
   where id = p_id and status = 'pending' and public.is_staff() and public.staff_can_see(client_email);
  if not found then
    raise exception 'Nothing to cancel';
  end if;
end;
$fn$;
revoke all on function public.staff_void_travel_auth(uuid) from public, anon;
grant execute on function public.staff_void_travel_auth(uuid) to authenticated;

-- Client: sign. In one step this records the signed values, logs the on-screen signature (the same record every
-- "sign on screen" document gets) and updates their profile with the corrected name, phone and nationality.
create or replace function public.sign_travel_auth(
  p_id uuid,
  p_values jsonb,
  p_document_path text,
  p_sha256 text,
  p_signer_name text,
  p_drawn text,
  p_user_agent text
) returns void
language plpgsql
security definer
set search_path = public, auth
as $fn$
declare
  v_email text := public.verified_email();
  v_req public.travel_auth_requests%rowtype;
begin
  if v_email is null or auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  select * into v_req from public.travel_auth_requests where id = p_id and lower(client_email) = v_email for update;
  if not found then
    raise exception 'Form not found';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'This form has already been signed or cancelled';
  end if;
  if p_document_path is null or left(p_document_path, length(v_email) + 1) <> v_email || '/' or position('..' in p_document_path) > 0 then
    raise exception 'Bad document path';
  end if;
  if length(trim(coalesce(p_signer_name, ''))) < 3 then
    raise exception 'Type your full name';
  end if;

  update public.travel_auth_requests
     set status = 'signed', signed_values = p_values, signed_at = now(), document_path = p_document_path
   where id = p_id;

  insert into public.document_signatures (user_id, client_email, document_path, document_title, document_sha256, signer_name, drawn_signature, user_agent)
  values (auth.uid(), v_email, p_document_path, 'Travel authorisation form', p_sha256, left(trim(p_signer_name), 160), p_drawn, left(p_user_agent, 300));

  -- Corrections flow back to the profile. Empty answers never wipe what is already there.
  insert into public.profiles (id, full_name, phone, nationality)
  values (auth.uid(), nullif(trim(p_values ->> 'name'), ''), nullif(trim(p_values ->> 'phone'), ''), nullif(trim(p_values ->> 'nationality'), ''))
  on conflict (id) do update
    set full_name = coalesce(nullif(trim(p_values ->> 'name'), ''), public.profiles.full_name),
        phone = coalesce(nullif(trim(p_values ->> 'phone'), ''), public.profiles.phone),
        nationality = coalesce(nullif(trim(p_values ->> 'nationality'), ''), public.profiles.nationality);
end;
$fn$;
revoke all on function public.sign_travel_auth(uuid, jsonb, text, text, text, text, text) from public, anon;
grant execute on function public.sign_travel_auth(uuid, jsonb, text, text, text, text, text) to authenticated;
