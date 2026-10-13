-- One payment per invoice: every card checkout session we open for an invoice is recorded here, so a payment on an older
-- session still finds its invoice, and re-tapping Pay within 20 minutes returns the same checkout.
-- Already applied. Safe to re-run.
create table if not exists public.invoice_card_sessions (
  reference_id text primary key,
  invoice_id uuid not null,
  customer_id text not null,
  amount_usd numeric(12, 2) not null,
  created_at timestamptz not null default now()
);
create index if not exists invoice_card_sessions_invoice_idx on public.invoice_card_sessions (invoice_id, created_at desc);
alter table public.invoice_card_sessions enable row level security;
revoke all on public.invoice_card_sessions from anon, authenticated;
