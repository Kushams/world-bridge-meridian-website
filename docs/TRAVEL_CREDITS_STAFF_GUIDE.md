# Travel Credits, Vouchers & Invite Program — staff guide

Setup (once, after review): run `supabase/travel-credits.sql`, then redeploy the edge functions `submit-form`, `notify-form-submission`, `notify-status-change`, `deliver-gift-cards`. Never put keys in the repo.

## Buying credits (customer pays in crypto)
1. A "Travel Credits purchase" email arrives. Check the transaction on the blockchain.
2. In Supabase → Table Editor → `form_submissions`, set that row's `status` to **confirmed**. The credits are added to the customer's account automatically (US$500–25,000) and they get an email.
3. If the payment is wrong, leave the status alone and email the customer.

## Gift cards
Unchanged: confirm the order, the codes are emailed. When redeemed the value becomes **Travel Credits** (never expire).

## Applying credits to a booking
Run in the SQL editor (service role):
- `select staff_apply_credits('customer@email', <standard_usd>, <promo_usd>, '<submission id or null>', 'note');`
- Promo credits: any booking, max 25% of the booking total (staff check this when applying). Standard credits can cover up to 100%.
- Refund a cancelled booking: `select staff_refund_credits('customer@email', <usd>, '<submission id or null>', 'note')` (see the function in the SQL file). Promo credits already used are not refunded.

## Promo credits and vouchers
- Give promo credits: `select staff_grant_promo('customer@email', 100, 90, 'Reason');`
- Make a voucher code: `select staff_create_voucher(100, 90, 180);` → send the code; the customer enters it under Travel Credits and gets Promo Credits.

## Invite Program
When an invited friend's journey (US$3,000+) is completed and paid, find the row in `invites` and set `status` = **completed**. Both accounts automatically receive US$500 Promo Credits (90 days). Setting it twice does nothing.

## Cashback
When a journey is completed and paid in full: `select staff_award_cashback('customer@email', <journey total usd>, '<submission id>', 'Italy trip');`
US$5,000+ → 15%, US$15,000+ → 20%, US$30,000+ → 25%, added as Promo Credits (90 days). It refuses a second award for the same submission. Change the tiers in the SQL function and `src/lib/credits.ts` together.
