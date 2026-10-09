-- Client uploads (passports etc.), on-screen signatures and returned signed files.
-- Safe to re-run EXCEPT the create policy / create trigger lines, which fail
-- harmlessly with "already exists" the second time.
--
-- Folders are named after the client's lower-case email, exactly like the
-- staff-to-client bucket in client-documents.sql. A signed-in client can only
-- touch the folder matching their own CONFIRMED email (public.verified_email()).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-uploads', 'client-uploads', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Clients read their own uploads"
  on storage.objects for select to authenticated
  using (bucket_id = 'client-uploads' and (storage.foldername(name))[1] = lower(public.verified_email()));

create policy "Clients add their own uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'client-uploads' and (storage.foldername(name))[1] = lower(public.verified_email()));

create policy "Clients delete their own uploads"
  on storage.objects for delete to authenticated
  using (bucket_id = 'client-uploads' and (storage.foldername(name))[1] = lower(public.verified_email()));

-- On-screen signatures. Append-only: a client can add and read their own,
-- never edit or delete. `document_sha256` fingerprints the exact file they saw.
create table if not exists public.document_signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete set null,
  client_email text not null,
  document_path text not null,
  document_title text not null,
  document_sha256 text,
  signer_name text not null,
  drawn_signature text,
  user_agent text,
  signed_at timestamptz not null default now(),
  unique (client_email, document_path)
);

alter table public.document_signatures enable row level security;

create policy "Clients sign as themselves"
  on public.document_signatures for insert to authenticated
  with check (user_id = auth.uid() and lower(client_email) = public.verified_email());

create policy "Clients read their own signatures"
  on public.document_signatures for select to authenticated
  using (lower(client_email) = public.verified_email());

-- The server decides when something was signed, not the browser.
create or replace function public.stamp_signature()
returns trigger language plpgsql as $fn$
begin
  new.signed_at := now();
  new.client_email := lower(new.client_email);
  return new;
end;
$fn$;

create trigger document_signatures_stamp
  before insert on public.document_signatures
  for each row execute function public.stamp_signature();
