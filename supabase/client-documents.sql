-- Private file area for each client (itineraries, tickets, vouchers).
-- Safe to re-run.
--
-- How it works: one private Storage bucket, `client-documents`. Staff upload
-- a client's files into a FOLDER NAMED AFTER THEIR EMAIL ADDRESS IN LOWER CASE
-- (e.g.  jane.doe@gmail.com/Paris-itinerary.pdf) using the Supabase dashboard
-- (Storage). A signed-in customer can read only the folder that matches their
-- own CONFIRMED email (public.verified_email(), from profiles-enquiries.sql),
-- so nobody can see another client's files. Customers cannot upload, change
-- or delete anything: only staff (service role / dashboard) can.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-documents', 'client-documents', false, 26214400,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Clients read their own documents" on storage.objects;
create policy "Clients read their own documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'client-documents'
    and (storage.foldername(name))[1] = lower(public.verified_email())
  );
