# How clients come in: exhibitions, packages, Design My Journey, contact

This is written for the owner and for any agent continuing the work. Every path ends in the same place: a saved request (`form_submissions`), emails to the team and the client, the Staff page, and the client's My World Bridge account.

## Every form requires an account
`/plan-your-journey`, `/contact` and `/travel-details-form` sit behind `AccountGate`, so the client signs in first with Google or email. This links each enquiry to a real client account, so it appears in their hub on the Staff page and in their own Enquiries tab.

If they first opened a staff member's personal link (`/?from=youssef`, `/?from=ravi`), the code is remembered in the browser. As soon as they're signed in with a confirmed email, they're assigned to that staff member (`StaffReferral` → `claim_staff_referral`). An existing assignment is never overwritten. Everyone else stays unassigned until an admin picks a coordinator on the Staff page ("Looked after by").

## 1. Exhibition clients
Exhibition, museum, art-fair and event listings → **Plan This Trip** button → `/travel-details-form?event=…&type=…&from=…&to=…`, with the event and dates pre-filled.
The form has 7 parts: traveller, exhibition and travel preferences, health and diet, emergency contact, companions, proposed itinerary, special requests. Passport/visa uploads go straight into the client's private Documents.
Saved as `form_type = travel-details` ("Exhibition travel itinerary form").

## 2. Package, destination and journey-story clients
`/travel-packages/<slug>`, `/destinations/<slug>`, `/journey-stories/<slug>` → **Request This Journey / Plan This Journey / Design This Journey For Me**
→ `/plan-your-journey?destination=<title>&notes=I'm interested in "<title>" (<page link>)`.
The wizard opens with the destination filled in, and the package name and link in "Additional information", so staff know exactly which package it was.

## 3. Design My Journey (no package chosen)
`/plan-your-journey` is a 10-step wizard:
1. Where do you want to go?
2. Where from, and when?
3. Who is traveling?
4. Journey type
5. What draws you in?
6. Pace & accommodation
7. Indicative journey investment
8. What should we organize?
9. Contact details (pre-filled from their profile)
10. Additional information (and whether to use Travel Credits / gift balance)

Saved as `form_type = journey-request` ("Journey request — <destination>").

## 4. Contact form
`/contact`: a general question, saved as `form_type = contact`.

## What happens after any of these is sent
1. The request is saved in `form_submissions` with status **Received**.
2. The `notify-form-submission` Edge Function emails:
   - **the team**: info@, every admin (Earl), and the client's assigned staff member if there is one. The email contains every answer plus an **Open this client** button (`/staff?client=<email>#clients`). Replying goes straight to the client.
   - **the client**: "We've received your journey request / travel itinerary form / message".
3. The request appears on the Staff page under **Requests** (assigned staff see only their own clients; admins see all), and in that client's hub.
4. The client sees it in **My World Bridge → Enquiries** as Received → In review → Proposal sent → Confirmed (or Closed).
5. When staff change the stage, the client is emailed automatically and a line appears in their chat.

## After the request: same for every client
On the Staff page client hub, staff can:
- chat by text and voice notes (every message is copied to info@ and the admins),
- send itineraries and tickets, documents to sign on screen, and forms to download, sign and return,
- create invoices (card via ePayVista, or crypto) and attach the detailed invoice PDF.

The client gets an email for each of these, and tapping the chat line opens the right section of their account.

## Reminder emails (`supabase/reminders.sql` + `send-reminders` Edge Function)
pg_cron runs `public.run_reminders()` every hour. It calls `send-reminders` using the same Vault key and shared secret as the form trigger.
- **Client hasn't replied:** if the latest row in a client's thread came from us (a staff message or voice note, a document, a document to sign, a form to return, an invoice, an invoice PDF, or a stage change) and the client hasn't answered for **3 days**, they get "We haven't heard from you" with a **Reply now** button. A second email goes after **7 days**, and that's the limit. No reminder is sent once the latest request is Confirmed or Closed, or if the thread has been quiet for more than 30 days. info@, the admins and the assigned coordinator are BCC'd.
- **Unassigned client:** at most once a day, info@ and the admins get a list of clients who sent a request more than 24 hours ago and still have no coordinator, each with an "Open this client" link.
- `public.reminder_log` stores one key per reminder sent (`noreply:<message id>:<1|2>`, `unassigned:<date>`), so nothing is sent twice. To change the timings, edit `NUDGES` / `DAY` in the function.

## Account controls on a client's page (`supabase/client-controls.sql` + `staff-client-action` Edge Function)

- **Send reminder:** emails the "Checking in" reminder now (calls `send-reminders` with `{email}`); info@, admins and the coordinator are copied.
- **Stop reminders / Turn reminders back on:** sets `client_flags.reminders_off`; `send-reminders` skips the client.
- **Block / Unblock account:** bans the auth user (`ban_duration`) so they can't sign in, and sets `client_flags.blocked` (no reminders while blocked).
- **Delete account (admins only):** removes the client's private files, messages, assignment, flags, requests and invoices, then the auth user.
- Staff can use the first three on their own clients; admins on every client. Checked server-side with the caller's JWT (`is_staff`, `staff_list_clients`, `is_admin`).
- Admins reading a thread see which staff member wrote each message (only their own messages show as "You").

## Open ideas (not built)
- Price levels: show 2–3 levels per package (e.g. Signature / Luxury / Ultra, each with a "From" price), and pass the chosen one into the wizard's budget step. Exhibitions would stay unpriced and be quoted by invoice.
