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

## Open ideas (not built)
- Email admins when a new client is still unassigned after N hours.
- Let clients pick a package "tier" (e.g. 4-star vs 5-star) on the package page and pass it into the wizard.
