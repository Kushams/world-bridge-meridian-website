-- Client <-> staff conversation, plus "we sent you a document"-style activity
-- lines. One thread per client (client_email). Run after staff.sql.
--
-- Who can read a thread: the client themselves, the staff member looking after
-- them, and admins (public.staff_can_see). Nobody writes to the table directly;
-- writes go through the functions below, which stamp the sender.

alter table public.staff_members add column if not exists title text;
update public.staff_members set title = 'Travel Coordinating Officer' where role = 'staff' and title is null;

create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_email text not null check (client_email = lower(client_email)),
  sender text not null check (sender in ('client', 'staff', 'system')),
  author_email text,
  author_name text,
  kind text not null default 'message'
    check (kind in ('message', 'document', 'sign', 'return', 'invoice', 'invoice_pdf', 'upload', 'signed', 'returned', 'status')),
  body text not null check (char_length(body) between 1 and 4000),
  link text check (link ~ '^#[a-z-]{1,40}$'),
  created_at timestamptz not null default now()
);

create index if not exists client_messages_thread_idx on public.client_messages (client_email, created_at);

alter table public.client_messages enable row level security;
revoke all on public.client_messages from anon, authenticated;
grant select on public.client_messages to authenticated;

drop policy if exists "Thread readers" on public.client_messages;
create policy "Thread readers" on public.client_messages for select to authenticated
  using (client_email = public.verified_email() or public.staff_can_see(client_email));

-- Client writes in their own thread.
create or replace function public.post_message(p_body text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
  new_id uuid;
begin
  if me is null then raise exception 'Sign in with a confirmed email first'; end if;
  if public.is_staff() then raise exception 'Staff reply from the staff page'; end if;
  insert into public.client_messages (client_email, sender, author_email, author_name, body)
  values (
    me, 'client', me,
    (select nullif(trim(p.full_name), '') from public.profiles p where p.id = auth.uid()),
    trim(p_body)
  )
  returning id into new_id;
  return new_id;
end;
$$;

-- Staff reply in a client's thread they are allowed to see.
create or replace function public.staff_post_message(p_client_email text, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
  new_id uuid;
begin
  if not public.staff_can_see(p_client_email) then raise exception 'Not your client'; end if;
  insert into public.client_messages (client_email, sender, author_email, author_name, body)
  values (
    lower(trim(p_client_email)), 'staff', me,
    (select coalesce(s.name, s.email) from public.staff_members s where s.email = me),
    trim(p_body)
  )
  returning id into new_id;
  return new_id;
end;
$$;

-- Activity lines. Staff log what they sent a client; clients log what they sent us.
create or replace function public.log_client_event(p_client_email text, p_kind text, p_body text, p_link text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me text := public.verified_email();
  target text := lower(trim(coalesce(p_client_email, '')));
begin
  if p_kind in ('document', 'sign', 'return', 'invoice', 'invoice_pdf') then
    if not public.staff_can_see(target) then raise exception 'Not your client'; end if;
  elsif p_kind in ('upload', 'signed', 'returned') then
    if me is null or target <> me then raise exception 'Own thread only'; end if;
  else
    raise exception 'Unknown event';
  end if;
  insert into public.client_messages (client_email, sender, author_email, author_name, kind, body, link)
  values (
    target, 'system', me,
    (select coalesce(s.name, s.email) from public.staff_members s where s.email = me),
    p_kind, left(trim(p_body), 4000), p_link
  );
end;
$$;

-- Request stage changes appear in the thread too (alongside the status email).
create or replace function public.log_status_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.form_type = 'newsletter' or new.status is not distinct from old.status then return new; end if;
  insert into public.client_messages (client_email, sender, kind, body, link)
  values (
    lower(new.email), 'system', 'status',
    format('Your request "%s" is now: %s',
      coalesce(nullif(trim(new.subject), ''), initcap(replace(new.form_type, '-', ' '))),
      case new.status::text
        when 'received' then 'Received' when 'in_review' then 'In review'
        when 'proposal_sent' then 'Proposal sent' when 'confirmed' then 'Confirmed'
        when 'closed' then 'Closed' else new.status::text end),
    '#enquiries'
  );
  return new;
end;
$$;

drop trigger if exists on_status_logged on public.form_submissions;
create trigger on_status_logged
  after update of status on public.form_submissions
  for each row execute function public.log_status_message();

-- The staff member looking after the signed-in client: only what a client
-- should see (name, title, work email, profile photo).
create or replace function public.my_handler()
returns table (name text, title text, email text, avatar_url text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(s.name, 'Your travel coordinator'),
         coalesce(s.title, 'Travel Coordinating Officer'),
         s.email,
         p.avatar_url
  from public.client_assignments a
  join public.staff_members s on s.email = a.staff_email
  left join auth.users u on lower(u.email) = s.email
  left join public.profiles p on p.id = u.id
  where a.client_email = public.verified_email()
  limit 1
$$;

revoke all on function public.post_message(text) from public, anon;
revoke all on function public.staff_post_message(text, text) from public, anon;
revoke all on function public.log_client_event(text, text, text, text) from public, anon;
revoke all on function public.log_status_message() from public, anon, authenticated;
revoke all on function public.my_handler() from public, anon;
grant execute on function public.post_message(text) to authenticated;
grant execute on function public.staff_post_message(text, text) to authenticated;
grant execute on function public.log_client_event(text, text, text, text) to authenticated;
grant execute on function public.my_handler() to authenticated;
