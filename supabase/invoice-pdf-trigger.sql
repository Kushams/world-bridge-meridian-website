-- Fires the generate-invoice-pdf edge function whenever an invoice is created, and again when
-- its status, line items, amounts or due date change, so every invoice always carries the
-- branded PDF the client's invoice page looks for — not just ones made in the staff builder.
-- Safe to re-run. A missing Vault key or a failed call never blocks the invoice write.
-- Uses the same Vault secrets as the other notify triggers.

create or replace function public.invoice_pdf_autogen()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  api_key text;
  shared_secret text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'notify_crypto_payment_key';
  select decrypted_secret into shared_secret from vault.decrypted_secrets where name = 'notify_crypto_payment_secret';
  if api_key is null then
    return new;
  end if;
  perform net.http_post(
    url := 'https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/generate-invoice-pdf',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key,
      'x-wbm-notify-secret', coalesce(shared_secret, '')
    ),
    body := jsonb_build_object('invoice_id', new.id)
  );
  return new;
exception when others then
  return new;
end;
$$;
revoke all on function public.invoice_pdf_autogen() from public, anon, authenticated;

drop trigger if exists invoice_pdf_on_insert on public.invoices;
create trigger invoice_pdf_on_insert
  after insert on public.invoices
  for each row
  execute function public.invoice_pdf_autogen();

drop trigger if exists invoice_pdf_on_update on public.invoices;
create trigger invoice_pdf_on_update
  after update on public.invoices
  for each row
  when (
    old.status is distinct from new.status
    or old.line_items is distinct from new.line_items
    or old.amount is distinct from new.amount
    or old.amount_usd is distinct from new.amount_usd
    or old.due_date is distinct from new.due_date
  )
  execute function public.invoice_pdf_autogen();
