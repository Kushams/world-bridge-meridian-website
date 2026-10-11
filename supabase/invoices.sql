-- Invoices a consultant sends to a client, payable by card from the client's account.
-- Run once in the Supabase SQL editor. Nothing here is applied automatically.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('INV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references auth.users (id) on delete restrict,
  description text not null check (char_length(description) between 3 and 500),
  amount_usd numeric(12, 2) not null check (amount_usd >= 5),
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'needs_review', 'void')),
  card_reference text unique,        -- ePayVista reference_id for this invoice's card session
  card_url text,                     -- hosted checkout link returned by ePayVista
  paid_at timestamptz,
  paid_via text,
  paid_txid text,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

-- Clients may read their own invoices and nothing else: no inserts, updates or deletes from the site.
drop policy if exists "Clients read their own invoices" on public.invoices;
create policy "Clients read their own invoices" on public.invoices
  for select to authenticated using (auth.uid() = user_id);

revoke all on public.invoices from anon, authenticated;
grant select on public.invoices to authenticated;

-- Staff: create an invoice from the SQL editor, e.g.
--   select public.create_invoice('client@example.com', 2450.00, 'Italy art journey — deposit');
create or replace function public.create_invoice(p_email text, p_amount numeric, p_description text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
  ref text;
begin
  select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if uid is null then
    raise exception 'No account found for %. The client must create an account with this email first.', p_email;
  end if;
  insert into public.invoices (user_id, description, amount_usd)
  values (uid, trim(p_description), round(p_amount, 2))
  returning reference into ref;
  return ref;
end;
$$;

revoke execute on function public.create_invoice(text, numeric, text) from public, anon, authenticated;
