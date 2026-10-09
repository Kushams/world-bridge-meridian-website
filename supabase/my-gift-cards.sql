-- Lets a signed-in customer see the gift cards THEY bought (for themselves or as presents).
-- The code is only returned for a card bought for themselves that is still unredeemed; for a present
-- they see who it went to and whether it has been redeemed, never the code.
create or replace function public.my_purchased_gift_cards()
returns table (
  id uuid, amount_cents integer, status text, design text, recipient_name text,
  is_self boolean, code text, delivered boolean, created_at timestamptz
)
language sql stable security definer set search_path = public as $fn$
  select c.id, c.amount_cents, c.status, c.design, c.recipient_name,
         lower(c.recipient_email) = lower(c.purchaser_email),
         case when lower(c.recipient_email) = lower(c.purchaser_email) and c.status = 'active' then c.code end,
         c.delivered_at is not null, c.created_at
  from public.gift_cards c
  where lower(c.purchaser_email) = lower(coalesce(public.verified_email(), ''))
  order by c.created_at desc
$fn$;
revoke all on function public.my_purchased_gift_cards() from public, anon;
grant execute on function public.my_purchased_gift_cards() to authenticated;
