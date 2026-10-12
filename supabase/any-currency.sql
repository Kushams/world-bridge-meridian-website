-- Invoice in any currency (staff pick from a long list: everywhere clients pay crypto from, except Africa).
-- Run once in the Supabase SQL editor. Safe to re-run.
--   1. The invoice's currency can be any 3-letter ISO code (it was limited to USD, EUR, GBP).
--   2. fx_rate gets more decimals (so currencies worth fractions of a cent, such as VND, keep their precision).
--   3. The two invoice functions accept any currency and any sensible exchange rate.

alter table public.invoices alter column fx_rate type numeric(18, 10);
alter table public.invoices drop constraint if exists invoices_currency_check;
alter table public.invoices add constraint invoices_currency_check check (currency ~ '^[A-Z]{3}$');

create or replace function public.staff_create_invoice_v2(
  p_email text, p_currency text, p_tax_percent numeric, p_fx_rate numeric, p_lines jsonb, p_due date default null
) returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
  ln jsonb;
  qty numeric;
  price numeric;
  sub numeric := 0;
  tax numeric;
  total numeric;
  rate numeric := 1;
  usd numeric;
  ref text;
  cleaned jsonb := '[]'::jsonb;
  label text;
begin
  if not public.is_staff() or not public.staff_can_see(p_email) then
    raise exception 'Staff only';
  end if;
  if p_currency !~ '^[A-Z]{3}$' then
    raise exception 'Unsupported currency';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) not between 1 and 40 then
    raise exception 'Add between 1 and 40 lines';
  end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if uid is null then
    raise exception 'No account found for %', p_email;
  end if;

  for ln in select * from jsonb_array_elements(p_lines) loop
    label := left(trim(coalesce(ln ->> 'title', '')), 160);
    if char_length(label) < 3 then
      raise exception 'Every line needs a name';
    end if;
    qty := coalesce((ln ->> 'qty')::numeric, 1);
    price := (ln ->> 'unit_price')::numeric;
    if qty <= 0 or qty > 1000 or price is null or price < 0 or price > 1000000 then
      raise exception 'Invalid quantity or price on "%"', label;
    end if;
    sub := sub + round(qty * price, 2);
    cleaned := cleaned || jsonb_build_array(jsonb_build_object(
      'title', label,
      'details', left(trim(coalesce(ln ->> 'details', '')), 1000),
      'qty', qty,
      'unit_price', price,
      'amount', round(qty * price, 2)
    ));
  end loop;

  tax := round(sub * coalesce(p_tax_percent, 0) / 100, 2);
  total := sub + tax;
  if p_currency <> 'USD' then
    rate := p_fx_rate;
    if rate is null or rate <= 0 or rate > 1000 then
      raise exception 'Enter a valid exchange rate';
    end if;
  end if;
  usd := round(total * rate, 2);
  if usd < 5 then
    raise exception 'The total must be at least US$5';
  end if;

  insert into public.invoices (user_id, description, amount_usd, currency, amount, subtotal, tax_percent, fx_rate, line_items, due_date)
  values (
    uid,
    left((cleaned -> 0 ->> 'title') || case when jsonb_array_length(cleaned) > 1 then ' + ' || (jsonb_array_length(cleaned) - 1) || ' more' else '' end, 500),
    usd, p_currency, total, sub, coalesce(p_tax_percent, 0), rate, cleaned, p_due
  )
  returning reference into ref;
  return ref;
end;
$$;
revoke all on function public.staff_create_invoice_v2(text, text, numeric, numeric, jsonb, date) from public, anon;
grant execute on function public.staff_create_invoice_v2(text, text, numeric, numeric, jsonb, date) to authenticated;


create or replace function public.staff_update_invoice(
  p_id uuid, p_currency text, p_tax_percent numeric, p_fx_rate numeric, p_lines jsonb, p_due date default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invoices%rowtype;
  ln jsonb;
  qty numeric;
  price numeric;
  sub numeric := 0;
  tax numeric;
  total numeric;
  rate numeric := 1;
  usd numeric;
  cleaned jsonb := '[]'::jsonb;
  label text;
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  select * into inv from public.invoices where id = p_id and kind = 'invoice';
  if not found or not public.staff_can_see_user(inv.user_id) then
    raise exception 'Invoice not found';
  end if;
  if inv.status <> 'unpaid' then
    raise exception 'Only unpaid invoices can be edited';
  end if;
  if p_currency !~ '^[A-Z]{3}$' then
    raise exception 'Unsupported currency';
  end if;
  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) not between 1 and 40 then
    raise exception 'Add between 1 and 40 lines';
  end if;

  for ln in select * from jsonb_array_elements(p_lines) loop
    label := left(trim(coalesce(ln ->> 'title', '')), 160);
    if char_length(label) < 3 then
      raise exception 'Every line needs a name';
    end if;
    qty := coalesce((ln ->> 'qty')::numeric, 1);
    price := (ln ->> 'unit_price')::numeric;
    if qty <= 0 or qty > 1000 or price is null or price < 0 or price > 1000000 then
      raise exception 'Invalid quantity or price on "%"', label;
    end if;
    sub := sub + round(qty * price, 2);
    cleaned := cleaned || jsonb_build_array(jsonb_build_object(
      'title', label,
      'details', left(trim(coalesce(ln ->> 'details', '')), 1000),
      'qty', qty,
      'unit_price', price,
      'amount', round(qty * price, 2)
    ));
  end loop;

  tax := round(sub * coalesce(p_tax_percent, 0) / 100, 2);
  total := sub + tax;
  if p_currency <> 'USD' then
    rate := p_fx_rate;
    if rate is null or rate <= 0 or rate > 1000 then
      raise exception 'Enter a valid exchange rate';
    end if;
  end if;
  usd := round(total * rate, 2);
  if usd < 5 then
    raise exception 'The total must be at least US$5';
  end if;

  update public.invoices
  set description = left((cleaned -> 0 ->> 'title') || case when jsonb_array_length(cleaned) > 1 then ' + ' || (jsonb_array_length(cleaned) - 1) || ' more' else '' end, 500),
      amount_usd = usd, currency = p_currency, amount = total, subtotal = sub,
      tax_percent = coalesce(p_tax_percent, 0), fx_rate = rate, line_items = cleaned, due_date = p_due
  where id = p_id;
end;
$$;
revoke all on function public.staff_update_invoice(uuid, text, numeric, numeric, jsonb, date) from public, anon;
grant execute on function public.staff_update_invoice(uuid, text, numeric, numeric, jsonb, date) to authenticated;
