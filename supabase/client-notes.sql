-- Private staff notes on a client (never shown to the client), and a "cancelled" mark on old card checkout sessions.
-- Already applied. Safe to re-run (the policy line errors if it exists: ignore).
alter table public.invoice_card_sessions add column if not exists cancelled_at timestamptz;

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_email text not null check (client_email = lower(client_email)),
  author_email text not null,
  author_name text,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  removed_at timestamptz
);
create index if not exists client_notes_client_idx on public.client_notes (client_email, created_at desc);
alter table public.client_notes enable row level security;
revoke all on public.client_notes from anon, authenticated;
grant select on public.client_notes to authenticated;
create policy "Staff read notes on their clients" on public.client_notes for select to authenticated using (public.is_staff() and removed_at is null and public.staff_can_see(client_email));
-- Writes go through staff_add_note / staff_remove_note (see the Supabase project).
