# Staff page, roles and client messages — handoff notes

For whoever picks this up next (human or AI agent). Branch: `devin/1791728075-staff-page` (PR #58).
Invoice redesign is PR #57; leadership/Events JSON-LD is PR #59. None are merged until the owner says "merge".

## What is live in Supabase already (project rkevnmqofvqdmjujlrvd)
Applied SQL, in order: `supabase/staff.sql`, then `supabase/messages.sql`. Both are idempotent (safe to re-run).
Deployed edge functions: `notify-client`, `notify-client-activity` (from this branch).

Staff list (`public.staff_members`):
| email | role | name | link code |
|---|---|---|---|
| info@worldbridgemeridian.group | admin | World Bridge Meridian | — |
| earla668@gmail.com | admin | Earl (Founder & CEO) | — |
| youssefamraniwbm@gmail.com | staff | Youssef Amrani | youssef |
| ravichandranwbm@gmail.com | staff | Ravi Chandran | ravi |

Add a staff member: `insert into public.staff_members (email, role, name, title, link_code) values ('x@gmail.com','staff','Full Name','Travel Coordinating Officer','first');`

## Rules (enforced in the database, not just the UI)
- Admins see every client; ordinary staff see only clients in `client_assignments` with their email (`staff_can_see`).
- Clients from the main site start unassigned; an admin assigns them on /staff → client → "Looked after by".
- Optional personal links `https://worldbridgemeridian.com/?from=<link_code>` auto-assign a new client (never overwrite).

## Messages (supabase/messages.sql)
- `client_messages`: one thread per client. Read: the client, their assigned staff, admins. No direct writes.
- `post_message(body)` (client), `staff_post_message(client_email, body)` (staff), `log_client_event(...)` (activity lines).
- Activity lines are written automatically: staff sends → `notify-client` logs "We sent you a document: …" etc.;
  client uploads/signs → `notify-client-activity` logs "Uploaded (passport): …"; status changes → trigger `on_status_logged`.
- Each line carries a link (`#documents`, `#invoices`, `#enquiries`) that opens the existing account section.
- Emails still go out: staff message → client email "You have a new message" + a copy to every admin (info@, Earl);
  client message → info@ + assigned staff + every admin. Everything lands at info@ for oversight.
- `my_handler()` gives the client their coordinator's name, title, email and profile photo (the staff member's own account photo).
- UI: client `My World Bridge → Messages` tab (`src/components/account/MessagesPanel.tsx`);
  staff `/staff → client → Messages` block (`src/components/staff/ClientHub.tsx`); shared `src/components/messages/Thread.tsx`.
  Threads refresh every 15 s while the tab is visible.
- Clients can also upload from the chat (paperclip). It saves to the same private folder as
  Itineraries & Documents → "Other" (`client-uploads/<email>/other/`), so it shows in both places and emails the team.
- Team emails for client activity have a button to `/staff?client=<email>#clients`, which opens that client's page directly.
  Staff replies are quoted in the client's email with a "Read and reply" button to `/my-world-bridge#messages`.

## Checks to run
`npm run lint`, `npx tsc --noEmit` (run `npx next typegen` first in a fresh worktree), `npm run build:cloudflare`.
