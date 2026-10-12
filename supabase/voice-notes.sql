-- Voice notes in the client/coordinator chat (run after supabase/messages.sql).
-- Audio lives in the private `chat-voice` bucket under <client email>/<ms>.<ext>;
-- the message row points at it. Same readers as the thread itself.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-voice', 'chat-voice', false, 10485760,
        array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Thread readers hear voice notes" on storage.objects;
create policy "Thread readers hear voice notes" on storage.objects
  for select to authenticated using (
    bucket_id = 'chat-voice'
    and ((storage.foldername(name))[1] = lower(public.verified_email())
         or public.staff_can_see((storage.foldername(name))[1])));

drop policy if exists "Thread members record voice notes" on storage.objects;
create policy "Thread members record voice notes" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'chat-voice'
    and ((storage.foldername(name))[1] = lower(public.verified_email())
         or public.staff_can_see((storage.foldername(name))[1])));

alter table public.client_messages add column if not exists audio_path text
  check (audio_path ~ '^[^/]+/[0-9]{10,16}\.(webm|ogg|mp4|m4a|mp3|aac)$');

alter table public.client_messages drop constraint if exists client_messages_kind_check;
alter table public.client_messages add constraint client_messages_kind_check
  check (kind in ('message', 'voice', 'document', 'sign', 'return', 'invoice', 'invoice_pdf',
                  'upload', 'signed', 'returned', 'status'));

-- p_path must be an uploaded object in the thread's own folder.
create or replace function public.post_voice(p_client_email text, p_path text, p_seconds int)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
  client text := lower(trim(p_client_email));
  staff boolean := public.is_staff();
  new_id uuid;
begin
  if me is null then raise exception 'Sign in with a confirmed email first'; end if;
  if staff then
    if not public.staff_can_see(client) then raise exception 'Not your client'; end if;
  elsif client <> me then
    raise exception 'Own thread only';
  end if;
  if split_part(p_path, '/', 1) <> client
     or not exists (select 1 from storage.objects o where o.bucket_id = 'chat-voice' and o.name = p_path) then
    raise exception 'Voice note not found';
  end if;
  insert into public.client_messages (client_email, sender, author_email, author_name, kind, body, audio_path)
  values (
    client,
    case when staff then 'staff' else 'client' end,
    me,
    case when staff then (select coalesce(s.name, s.email) from public.staff_members s where s.email = me)
         else (select nullif(trim(p.full_name), '') from public.profiles p where p.id = auth.uid()) end,
    'voice',
    format('Voice note (%s)', to_char(make_interval(secs => greatest(1, least(coalesce(p_seconds, 1), 600))), 'FMMI:SS')),
    p_path
  )
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.post_voice(text, text, int) from public, anon;
grant execute on function public.post_voice(text, text, int) to authenticated;
