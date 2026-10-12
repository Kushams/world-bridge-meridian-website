-- Staff (not only admins) can manage the price book and edit unpaid invoices.
-- Run once in the Supabase SQL editor. Safe to re-run.

-- 1. Any staff member can add or change price book items.
create or replace function public.admin_save_price_item(
  p_id uuid, p_name text, p_details text, p_unit_price numeric, p_currency text, p_unit text, p_category text, p_active boolean
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  out_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Staff only';
  end if;
  if p_id is null then
    insert into public.price_book (name, details, unit_price, currency, unit, category, active)
    values (trim(p_name), nullif(trim(coalesce(p_details, '')), ''), p_unit_price, p_currency, nullif(trim(coalesce(p_unit, '')), ''), p_category, coalesce(p_active, true))
    returning id into out_id;
  else
    update public.price_book
    set name = trim(p_name), details = nullif(trim(coalesce(p_details, '')), ''), unit_price = p_unit_price, currency = p_currency,
        unit = nullif(trim(coalesce(p_unit, '')), ''), category = p_category, active = coalesce(p_active, true)
    where id = p_id
    returning id into out_id;
  end if;
  return out_id;
end;
$$;

-- 2. Edit an unpaid invoice: rename lines, change prices, remove lines, change currency, tax or due date.
-- Totals are recomputed here from the lines. Paid, cancelled and under-review invoices cannot be edited.
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
  if p_currency not in ('USD', 'EUR', 'GBP') then
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
    if rate is null or rate < 0.2 or rate > 5 then
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
