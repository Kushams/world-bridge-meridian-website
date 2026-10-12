-- Bank transfer details on an invoice, added by staff after the client asks to pay by transfer.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- The text lives on the invoice row, so it is only ever readable by that client (existing policy
-- "Clients read their own invoices") and by staff who can see the client. Nothing shows on an invoice
-- until staff paste details into it.

alter table public.invoices add column if not exists bank_details text;
alter table public.invoices drop constraint if exists invoices_bank_details_len;
alter table public.invoices add constraint invoices_bank_details_len
  check (bank_details is null or char_length(bank_details) between 5 and 1500);

-- Staff: paste (or replace) the bank details for one unpaid invoice. An empty value removes them again.
create or replace function public.staff_set_invoice_bank_details(p_id uuid, p_details text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean text := nullif(trim(coalesce(p_details, '')), '');
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  update public.invoices
  set bank_details = clean
  where id = p_id and kind = 'invoice' and status in ('unpaid', 'needs_review') and public.staff_can_see_user(user_id);
  if not found then
    raise exception 'Invoice not found, already paid or cancelled';
  end if;
end;
$$;
revoke all on function public.staff_set_invoice_bank_details(uuid, text) from public, anon;
grant execute on function public.staff_set_invoice_bank_details(uuid, text) to authenticated;

-- Staff: a bank transfer arrived, mark the invoice paid. Card and crypto payments are marked automatically.
create or replace function public.staff_mark_invoice_paid(p_id uuid, p_via text default 'bank transfer')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  update public.invoices
  set status = 'paid', paid_at = now(), paid_via = left(coalesce(nullif(trim(p_via), ''), 'bank transfer'), 40)
  where id = p_id and kind = 'invoice' and status in ('unpaid', 'needs_review') and public.staff_can_see_user(user_id);
  if not found then
    raise exception 'Invoice not found, already paid or cancelled';
  end if;
end;
$$;
revoke all on function public.staff_mark_invoice_paid(uuid, text) from public, anon;
grant execute on function public.staff_mark_invoice_paid(uuid, text) to authenticated;
