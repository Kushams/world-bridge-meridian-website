-- Invoice builder: line items, currency (USD / EUR / GBP), optional tax, due date, and a shared price book.
-- Run once in the Supabase SQL editor. Safe to re-run. Existing invoices are untouched (they stay USD, no line items).
--
-- How money works:
--   * amount_usd stays the US-dollar amount that the card / crypto checkout charges (and the webhook checks).
--   * For EUR / GBP invoices, `amount` is the total in that currency and fx_rate is the rate staff confirmed when
--     creating the invoice, so amount_usd = round(amount * fx_rate, 2).
--   * Totals are always recomputed in the database from the line items, never trusted from the browser.

alter table public.invoices add column if not exists currency text not null default 'USD';
alter table public.invoices add column if not exists amount numeric(12, 2);
alter table public.invoices add column if not exists subtotal numeric(12, 2);
alter table public.invoices add column if not exists tax_percent numeric(5, 2) not null default 0;
alter table public.invoices add column if not exists fx_rate numeric(12, 6) not null default 1;
alter table public.invoices add column if not exists line_items jsonb;
alter table public.invoices add column if not exists due_date date;

alter table public.invoices drop constraint if exists invoices_currency_check;
alter table public.invoices add constraint invoices_currency_check check (currency in ('USD', 'EUR', 'GBP'));
alter table public.invoices drop constraint if exists invoices_tax_percent_check;
alter table public.invoices add constraint invoices_tax_percent_check check (tax_percent between 0 and 100);
alter table public.invoices drop constraint if exists invoices_fx_rate_check;
alter table public.invoices add constraint invoices_fx_rate_check check (fx_rate > 0);

-- The price book: one shared list. Staff can read it; only admins change it (through the functions below).
create table if not exists public.price_book (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  details text check (details is null or char_length(details) <= 1000),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  currency text not null default 'EUR' check (currency in ('USD', 'EUR', 'GBP')),
  unit text check (unit is null or char_length(unit) <= 20),
  category text not null default 'Services' check (category in ('Services', 'Materials', 'Other')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.price_book enable row level security;
revoke all on public.price_book from anon, authenticated;
grant select on public.price_book to authenticated;

drop policy if exists "Staff read the price book" on public.price_book;
create policy "Staff read the price book" on public.price_book
  for select to authenticated using (public.is_staff());

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
  if not public.is_admin() then
    raise exception 'Admins only';
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
revoke all on function public.admin_save_price_item(uuid, text, text, numeric, text, text, text, boolean) from public, anon;
grant execute on function public.admin_save_price_item(uuid, text, text, numeric, text, text, text, boolean) to authenticated;

create or replace function public.admin_delete_price_item(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  delete from public.price_book where id = p_id;
end;
$$;
revoke all on function public.admin_delete_price_item(uuid) from public, anon;
grant execute on function public.admin_delete_price_item(uuid) to authenticated;

-- Starter prices (only if the book is empty). Edit them on the staff page: Team tab, Price book (admins).
insert into public.price_book (name, details, unit_price, currency, unit, category)
select v.name, v.details, v.unit_price, v.currency, v.unit, v.category
from (values
  ('Accommodation', null::text, 210::numeric, 'EUR', 'day', 'Services'),
  ('Accommodation (Videographer)', null, 120, 'EUR', null, 'Services'),
  ('Agency/Service Fee', 'Booking & Coordination Fee', 200, 'EUR', null, 'Services'),
  ('ETA Visa', null, 23, 'EUR', null, 'Services'),
  ('Fare revalidation adjustment', null, 300, 'EUR', null, 'Services'),
  ('Flights (Round Trip) + Luggage', null, 650, 'EUR', null, 'Services'),
  ('Ground Transportation with Private Driver', null, 100, 'EUR', null, 'Services'),
  ('Itinerary (Round Trip)', null, 689, 'EUR', null, 'Services'),
  ('Immediate / same-day ticket issuance', null, 150, 'EUR', null, 'Services'),
  ('Luggage (Round Trip)', null, 50, 'EUR', null, 'Services'),
  ('Standard Visitor''s Visa (Priority)', null, 250, 'EUR', null, 'Services'),
  ('Temporary/Emergency Passport', null, 115, 'EUR', null, 'Services'),
  ('Train (Round Trip)', null, 190, 'EUR', null, 'Services')
) as v(name, details, unit_price, currency, unit, category)
where not exists (select 1 from public.price_book);

-- Create an invoice from line items. Totals are recomputed here from the lines.
-- p_lines: [{ "title": "...", "details": "...", "qty": 1, "unit_price": 100 }, ...]
-- Returns the invoice reference (INV-XXXXXXXX).
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
  if p_currency not in ('USD', 'EUR', 'GBP') then
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
    if rate is null or rate < 0.2 or rate > 5 then
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
