# Invoices and card payments (staff guide)

Clients pay by card from their own account. Your consultant creates an invoice; the client opens it under
**My World Bridge Meridian -> Invoices** and taps **Pay by card**. They pay on ePayVista's page; ePayVista
tells us it is paid; the invoice flips to **Paid** by itself and we get an email.

## One-time setup (the owner)
1. In the Supabase SQL editor, run `supabase/invoices.sql`.
2. Supabase -> Edge Functions -> Secrets: add `EPV_API_KEY` and `EPV_CALLBACK_SECRET` (from
   pay.epayvista.com/portal -> Developer). `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` already exist.
   **Never paste these keys into chat, a file or the repo.**
3. Deploy the two functions in `supabase/functions/`: `invoice-card-pay` (JWT verification ON) and
   `epv-webhook` (JWT verification **OFF**, it is secured by ePayVista's signature).
4. Register the callback with ePayVista: `POST https://pay.epayvista.com/api/v1/merchant/callback`
   with `{"callback_url": "https://rkevnmqofvqdmjujlrvd.supabase.co/functions/v1/epv-webhook"}` and your API key header
   `API-Key` (or paste it into the Developer page if there is a box).
5. In ePayVista set your payout wallet (USDC on Base).

Test first in ePayVista's sandbox: set the secrets `EPV_BASE_URL=https://pay.epayvista.com/sandbox` and
`EPV_CURRENCY=TUSDC` with a sandbox key (POST /sandbox/keys), then remove those two secrets and swap in live keys.

## Sending an invoice (consultants)
In the Supabase SQL editor:

    select public.create_invoice('client@example.com', 2450.00, 'Italy art journey — deposit');

The client must already have an account with that email. It returns the invoice reference (e.g. INV-3F9A1C20).
Tell the client it is waiting in their account. To cancel an invoice: Table Editor -> invoices -> set `status` to `void`.

### Attach the detailed invoice PDF (optional, recommended)
The client sees a **View invoice (PDF)** button on the invoice once you upload it:

1. Supabase -> Storage -> bucket **client-documents** -> open the client's folder (their email, all lower case;
   create it if needed).
2. Inside it, **Create folder** named `invoices` and open it.
3. **Upload file**: the PDF, named so it **starts with the invoice reference**, e.g. `INV-3F9A1C20.pdf` or
   `INV-3F9A1C20 - Italy deposit.pdf`.

Only that client can open it. To replace it, delete the old file and upload the new one with the same reference at
the start of the name.

## If something looks wrong
- Status **needs_review**: the provider's amount or state did not match the invoice. Check the payment in the
  ePayVista portal, then set the invoice to `paid` or `unpaid` in Table Editor.
- Card minimum is US$5 on Base/Polygon (US$20 on Ethereum). Invoices under US$5 are rejected by the database.
- Cards issued outside the US can be declined by the provider. Offer bank transfer or crypto.
