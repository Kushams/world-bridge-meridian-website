-- Card payments (ePayVista) for Travel Credits and gift cards, reusing the invoices table.
-- Run once in the Supabase SQL editor, after invoices.sql. Then deploy `order-card-pay`
-- and redeploy `epv-webhook` and `notify-form-submission`.
--
-- Flow: a signed-in client picks an amount and "Pay by card". order-card-pay stores the order
-- as an invoices row (kind travel-credits / gift-card) and opens ePayVista. When ePayVista
-- confirms payment, epv-webhook records it as a form_submissions row and sets it to "confirmed",
-- so the existing triggers add the credits or create and email the gift cards automatically.

alter table public.invoices add column if not exists kind text not null default 'invoice';
alter table public.invoices drop constraint if exists invoices_kind_check;
alter table public.invoices add constraint invoices_kind_check check (kind in ('invoice', 'travel-credits', 'gift-card'));
alter table public.invoices add column if not exists order_details jsonb;
alter table public.invoices add column if not exists submission_id uuid references public.form_submissions (id) on delete set null;
