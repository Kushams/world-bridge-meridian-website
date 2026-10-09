# Gift cards: how your team runs them

Clients buy at `/gift-cards`, pay in crypto, and your team verifies the payment by hand. Nothing is issued until you say so.

## 1. A gift card order arrives
- You get an email titled **Gift card order** at `info@worldbridgemeridian.group`, and a row appears in Supabase →
  Table Editor → **form_submissions** (`form_type` = `gift-card`, status `received`).
- The row's `payload` shows: amount per card, quantity, total, asset, network, our address, **transaction hash**, the
  buyer, and the recipient and message if it is a gift.

## 2. Check the payment
1. Copy the `transaction_hash` and look it up on the right explorer (Bitcoin: mempool.space, Ethereum/Base/BNB:
   etherscan.io / basescan.org / bscscan.com, Tron: tronscan.org, Solana: solscan.io).
2. Confirm: it is **confirmed on-chain**, it went to **our address**, it is the **right asset and network**, and the
   **value is at least the order total** (US$ amount × quantity, at today's rate).
3. If anything is off (too little, wrong network, not found), do **not** confirm. Reply to the buyer by email.
   Underpayment: ask for the difference. Wrong network: contact them before doing anything.

## 3. Issue the card(s)
Set the row's **status** to **confirmed** (Table Editor, dropdown). That alone:
- creates one gift card per quantity, each with a unique secret code like `K7QM-2XPD-9TFH-4WNC`;
- emails each code to the recipient (or to the buyer if it is not a gift) and a receipt to the buyer.

It only happens once: setting *confirmed* again will not make duplicates. If the amount or quantity in the payload is
outside US$50 to US$25,000 total, Supabase refuses with a clear message; fix the payload or contact the buyer.

## 4. When a client redeems
The client signs in → **My World Bridge → Gift cards** → enters the code. The card is then linked to their account and
they see the balance. Look in Table Editor → **gift_cards** (`owner_user_id`, `claimed_at`, `balance_cents`).

## 5. Applying a card to a journey
Table Editor → **gift_card_ledger** → **Insert row**:
- `card_id`: the card's `id` from the **gift_cards** table
- `delta_cents`: a **negative** number in cents (US$200 → `-20000`)
- `note`: what it was used for (the client sees this), e.g. "Italy journey deposit"

The balance updates automatically. The client sees the new balance and the line in their history. Supabase will refuse
a use that is bigger than the balance. To add value back (a correction), insert a positive number.

## 6. Problems
- **Lost code:** look up the card in **gift_cards** by the buyer or recipient email. If you are sure it is the right
  person and the card is unused, email the code again from your own mailbox (never paste it in a public place).
- **Stolen or misused:** set the card's `status` to `void`. It then cannot be redeemed or spent.
- **Wrong recipient email:** if unredeemed, you can correct `recipient_email` and email the code to the right person.
- **Refunds:** cards are not refundable once issued, except where the law requires (see the terms).

## 7. Later: automatic payment checking
Today you check payments by hand. A crypto payment service (such as NOWPayments, Coinbase Business or BitPay) can check
payments automatically: it creates a unique invoice and amount per order, and when the money arrives it tells our
site, which sets the order to *confirmed* the same way you do in step 3. Nothing else would change. It needs a business
account with that provider, an API key and webhook secret saved as Supabase secrets, and it charges a small fee.
