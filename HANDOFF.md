# HANDOFF: World Bridge Meridian website

Last updated: **2026-11-08** by Claude Code (session that ran from 2026-10-15; this file was written at the end of it).
Read this first. It is written so a different assistant (for example "Muse", connected to GitHub as Kushams) can continue
the work from the repository alone, with no access to the chat that produced it.

Companion files: `docs/handoff-artifacts/` (email and scripts made in this session, see its README) and the older
handoff notes in `docs/` (`DEVIN_HANDOFF.md`, `STAFF_AND_MESSAGES_HANDOFF.md`, `DEPLOYING.md`, `INVOICES_AND_CARD_PAYMENTS.md`).
`AGENTS.md` warns that this Next.js version has breaking changes: read the matching guide in `node_modules/next/dist/docs/`
before writing Next.js code.

---------------------------------------------------------------------------------------------------------------------

## 0. Standing instruction from the owner (applies to every session)

GitHub is the source of truth. Every session must:
1. Keep this file (`HANDOFF.md`, repo root, one file only) current before finishing and after major milestones.
2. Commit and push **all** work (code, documents, reports, notes). After pushing, confirm the push worked and give the
   commit hash. Never claim something is saved unless the push succeeded.
3. Never commit secrets: no API keys, passwords, tokens, `.env` files. Refer to secrets by name only.
4. Write for a reader with no chat context. If a later session corrects something, update the old text here instead
   of leaving two versions.

Other working rules the owner has set (collected over the project):
- **Merge only when the owner says "merge".** One pull request at a time, then check the live site. (On 2026-10-15 PR #90
  was merged a moment before the owner said "don't merge yet"; the owner was told. See section 6.)
- Ask before production changes. Never ask the owner to paste secrets in chat.
- Send screenshots/files with visual or document changes. Plain language, not jargon.
- Squash-merge style: history shows one commit per PR, titled "... (#N)".

---------------------------------------------------------------------------------------------------------------------

## 1. The project at a glance

- **Business:** World Bridge Meridian ("WBM"), a bespoke travel group, a branch of **World Bridge Global Consulting LLC**
  (Illinois LLC; the registration number and the headquarters address are held by the owner and are deliberately not written in this public repository). Founder & CEO: **Earl Anderson**. Public site:
  https://worldbridgemeridian.com. Company email: info@worldbridgemeridian.group. Phone and WhatsApp (same number):
  +1 (302) 627-3325. WBM works with galleries (notably Pace Gallery): galleries' creators/staff are travelled by WBM,
  which plans the whole trip.
- **Repo:** https://github.com/Kushams/world-bridge-meridian-website (default branch `main`).
- **Stack:** Next.js static export (`STATIC_EXPORT=true`), Tailwind v4 tokens, Supabase (Postgres with row-level security,
  SECURITY DEFINER functions, Deno edge functions, private storage buckets), Resend (email), Tawk.to (chat), ePayVista
  (card + crypto checkout), jsPDF (PDFs built in the browser, Montserrat fonts in `public/fonts/pdf`).
- **Hosting:** the live site is built from `main` by **Cloudflare** (`wrangler.jsonc`, static assets from `out/`). Pushing
  to `main` deploys. (The comment in `.github/workflows/deploy-pages.yml` still says Netlify: that is out of date.)
- **Preview mirror:** GitHub Pages at https://kushams.github.io/world-bridge-meridian-website/ is built only from a branch
  named `preview` (workflow `deploy-pages.yml`). It was last built **2026-09-28**, so it is far behind `main`. Pull requests
  do not get their own preview link. To refresh it, push the wanted code to the `preview` branch.
- **Supabase project:** ref `rkevnmqofvqdmjujlrvd`, region eu-west-1 (Ireland). Edge functions need `verify_jwt` true except
  `epv-webhook` (false, it checks an HMAC signature). Secrets (Resend, ePayVista, Turnstile, etc.) are function secrets in
  Supabase, never in the repo.
- **People on the staff list (table `staff_members`):** Earl (admin), the shared company account info@ (admin), Ravi Chandran
  (staff, personal link code `ravi`, so `?from=ravi` attributes sign-ups to him), Youssef Amrani (staff). Staff see only
  clients assigned to them; admins see everyone (`staff_can_see`).
- **Tests and checks:** `npm test` runs `node --test tests/*.test.mjs` (money rules, ePayVista webhook rules, receipts,
  referral, exhibition listings, travel form, WhatsApp, place lines; 86 passing at the time of PR #90). CI
  (`.github/workflows/ci.yml`) runs tests, lint, build and `tsc` on every pull request.
  Static build for screenshots: `STATIC_EXPORT=true NEXT_PUBLIC_SUPABASE_URL=https://mock.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon npm run build`.
- Automated commits also land on `main` weekly (exhibition and event refreshes, 2026-10-19, 10-26, 11-02): not part of this session.

---------------------------------------------------------------------------------------------------------------------

## 2. What this session was about

The owner kept requesting features and fixes for the site and for client communications. Work fell into two periods.

### 2a. Before 2026-10-15 (earlier in the same long session; summarised, all merged unless stated)
- **Card checkout identifiers.** ePayVista now gets a random per-checkout reference (`customerID` = `WBM-` + 12 hex) from
  `supabase/functions/invoice-card-pay`. The invoice number itself is already random (`INV-` + 8 hex) and never changes; the
  checkout page shows it. A client who taps Pay again within 20 minutes gets the same checkout; every checkout session is
  recorded in `invoice_card_sessions` so a late payment on an old session still finds its invoice.
- **Pull requests #78 to #84** merged one by one on the owner's "merge".
- **Chat button.** Tawk's own green bubble is never shown (`src/components/TawkChat.tsx`); our own draggable button opens the
  Tawk window and comes back when it is closed.
- **Automatic tests** for the money rules, then for the ePayVista webhook rules (`supabase/functions/_shared/pay-rules.ts`) and
  the receipt PDFs; `npm test` runs on every pull request.
- **Referral.** `src/lib/referral.ts` accepts `?ref=` or `?from=` and ignores date-shaped values; the return path keeps its query string.
- **Pace "Mudlarkers" photo** used exactly as the owner uploaded it (no crop).
- **A detail page for every exhibition, museum show and art fair** (109 listings, `src/data/exhibitions.ts`, routes
  `/exhibitions/[slug]`, `/museums/[slug]`, `/art-fairs/[slug]`), with the "Official page" link going to that exact show on the
  venue's own site. Three still link to generic venue pages (Julie Curtiss *UNREAL* and Georg Baselitz *Meine Schule* at Gagosian;
  *Engineering* in the Prado). Thea Djordjadze's end date was set to 19 Dec 2026 from the gallery page, which is inconsistent:
  the owner should confirm.
- **Creators' "Plan your trip" email** (standalone HTML, not on the site): see `docs/handoff-artifacts/creators-email/`.
- **Travel Authorisation Form PDF** built from two Arts Abroad forms the owner uploaded (first as a static PDF; superseded in 2b).

### 2b. 2026-10-15 onward (the main body of this file)

**1. Travel Authorisation Form: client fills in and signs on screen (PR #85, merged, live).**
The owner wanted a branded, one-page A4 form WBM can send to a client in one click from the staff page, which the client completes
and signs on screen. Design:
- Staff open a client (staff page, "Send a document" block, component `src/components/staff/TravelAuthSender.tsx`), pick the
  **exhibition** (a dropdown of all 109 listings; it is pre-matched from the client's exhibition travel request), which fills the
  **destination** (venue city and country; UK destinations get the UK form with a "UK ETA" entry-status section, others do not).
  **Costs covered by** defaults to "Pace Gallery" (the list suggests other gallery names). Staff can instead send a printable
  version (file prefixed `RETURN - `) that the client signs by hand.
- The form is signed for WBM by **one company signature**: Earl Anderson, "Founder & Chief Executive Officer", applied
  automatically to every form whoever sends it (owner: "that should be the automatic signature for all the staff"). It is stored in
  the database table `company_signature` (one row), read by staff only through `company_signer()`, changed only by an admin through
  `admin_set_company_signature()`. The image came from the signature on an Arts Abroad form the owner uploaded; the owner first
  said it was Ravi's, then corrected: it is **Earl's**. **The image is NOT in git** (by design); to see or change it use the
  "Change signature" control in the staff panel (admins only).
- The client sees "Fill in & sign" under **Waiting on you** (inbox card, `DocumentsToDo.tsx`) and in Documents
  (`DocumentsPanel.tsx`, shared rows in `TravelFormRows.tsx`). The dialog (`SignTravelAuthDialog.tsx`) opens with everything we know
  pre-filled (from the staff snapshot, then their profile). They can correct any of it. Locked, set by staff: trip, destination,
  costs covered by, signer. Required to sign: full name, date of birth, nationality, passport number, passport expiry, phone,
  emergency contact name and phone; plus typed name, optional drawn signature, and an "I agree" tick.
- On signing, the browser builds the signed one-page PDF (`src/lib/travelAuthPdf.ts`; data mapping in `src/lib/travelAuthData.ts`),
  uploads it to the private bucket `client-uploads` at `<client email>/returned/Travel_authorisation_form_signed_<first 8 of id>.pdf`,
  then calls the database function `sign_travel_auth` which, in one step: marks the request signed, records the on-screen signature
  in `document_signatures` (with a SHA-256 of the file), and **updates the client's profile with the corrected name, phone and
  nationality** (only those; empty answers never overwrite; **passport numbers are never saved to the profile**; the owner asked for
  profile corrections to flow back: "don't leave it out. I want that"). The team is notified (email with a link, push).
- The staff panel lists the forms sent to that client (waiting / signed with "Open signed PDF" / cancelled) and lets staff cancel a pending one.
- "Country of issue" was removed from the form (owner: not necessary).
- Layout facts: one A4 page always (the builder throws if content overflows); signature images keep their proportions; the company
  signature sits right-aligned above the name line (56 x 15.4 mm box), the traveller's drawn signature at left (40 x 10 mm).
- **Database (applied to the live project on 2026-10-15)** from `supabase/travel-auth-requests.sql`, run as migration
  `travel_auth_requests`: tables `company_signature`, `travel_auth_requests`; functions `company_signer`, `admin_set_company_signature`,
  `staff_create_travel_auth`, `staff_void_travel_auth`, `sign_travel_auth`; row-level security so clients read their own forms and staff read
  those of clients they can see. The company signature row was then inserted (name "Earl Anderson").
- Tests: `tests/travel-auth.test.mjs` (data mapping, UK vs other, one page in every variant, profile patch, destination, listing match).
- **Never exercised on the live database by a real client yet.** It was tested end to end with a pretend client and mocked Supabase
  (`docs/handoff-artifacts/qa-scripts/travel-auth-flow.mjs`).

**2. Footer overlap on iPad (PR #86, merged, live).** On an iPad Pro in portrait (1024 px) the four-column footer made the first column
narrower than the company name, so it overlapped "Explore". Four columns now start at `xl` (1280 px); between `lg` and `xl` the brand
block has its own row (`src/components/layout/Footer.tsx`).

**3. WhatsApp links (PR #87, merged, live).** `company.whatsapp` (`src/data/company.ts`) is the same number as the phone. "WhatsApp us" /
"Message us on WhatsApp" / "Ask us on WhatsApp" appear on the contact page, the footer (desktop and mobile), the menu and every upcoming
exhibition page. The link (`src/lib/whatsapp.ts`, tests in `tests/whatsapp.test.mjs`) opens WhatsApp with a ready message:
"Hello World Bridge Meridian, my name is [your name]. I'd like to ask about [your trip or exhibition]." (the exhibition version names the
show and venue). The owner clarified: **the WhatsApp number is the general Client Services line, not Ravi's**; only the exhibition buttons in the
creators' email carry Ravi's `?from=ravi`.

**4. Removed "What would you like us to arrange?" from the exhibition travel form (PR #88, merged, live).** Owner: "we plan the whole trip",
so clients should not choose parts. `src/components/forms/TravelDetailsForm.tsx`. Old submissions that answered it still show it
(`notify-form-submission` still lists the key `please_arrange`).

**5. Photo headers (PRs #89 and #90, merged, live).** (a) The decorative blur strip at the top of every photo header sat above the heading,
so the first line of the small gold heading was blurred on phones; heading content is now `relative z-20`. (b) Venue lines no longer repeat the
city ("Pace Gallery, London · London, United Kingdom" is now "Pace Gallery, London · United Kingdom"; helper `src/lib/place.ts`,
`tests/place.test.mjs`). (c) The owner then said the strip still looked bad ("very ill"): the four stacked backdrop-blur bands in
`HeroBlurTransition.tsx` were replaced with one soft gradient shade (`.scrim-hero-top` in `src/app/globals.css`), no blur at all.

**6. Passport data no longer goes out by email in full (branch `claude/no-passport-in-email`, commit d4835da; NOT merged; the functions are already live).**
Owner asked to change passport copies emailed to the team into a secure link. Findings and changes:
- `notify-client-activity` used to attach uploaded files (including passport photos) to the team notification email. It now never attaches;
  the email says the file is saved securely and links to the client's page on the staff site (staff sign in to open it).
- `notify-form-submission` emailed the full passport number (and companions' passport numbers) in the team copy of every travel request.
  It now shows only the last three characters (shared helper `supabase/functions/_shared/privacy.ts`, tests `tests/privacy.test.mjs`).
- **Deployed to the live Supabase project on 2026-10-15** as `notify-client-activity` version 11 and `notify-form-submission` version 13
  (`verify_jwt` true). Smoke test: an unauthenticated call returned the function's own 401/403, so both start. They were deployed from
  the repo's current files, which also contain the staff push-notification calls (`pushToTeam`); the live versions before this were
  older than the repo and did not have those. Push failures cannot break emails (`sendPush` never throws).
- The pull request for the branch has **not been opened** (GitHub tools were unavailable when this was written) and the repo's `main` does
  not yet contain these files, so `main` and the deployed functions differ until it is merged. 91 tests pass on that branch (86 on `main`).

**7. Client due-diligence reply (documents are in `docs/handoff-artifacts/diana-verification/`).** A prospective Pace creator asked, before uploading her passport or creating an
account, for: (1) full registered company name and registration number, (2) registered office address, (3) name of the legal representative, (4) proof of the official
partnership with Pace Gallery, (5) the name and direct @pacegallery.com email of the Pace employee who authorised WBM's appointment, (6) GDPR data controller details
and privacy contact, (7) where passport copies are stored and for how long, (8) proof of professional liability insurance. The assistant drafted:
- a **plain-text reply** (the owner decided: plain text, not HTML), signed by Earl Anderson;
- a branded 2-page **Data Protection and Passport Handling Statement** (PDF);
- a 1-page **confirmation-letter template** for a Pace employee to complete on Pace letterhead (it is not proof until Pace signs it).
Facts used: the Illinois registration number and the headquarters address were supplied by the owner in chat (the owner described the address as the headquarters and it was used as
the registered office); legal representative Earl Anderson, Founder & Chief Executive Officer; data stored in the EU (Ireland); retention **"14 days after your trip has been confirmed"**
(owner's words); privacy contact info@worldbridgemeridian.group.
Owner decisions: the documents must **not name the hosting suppliers**; the hosting **region** (EU/Ireland) is kept because the creator asked where passports are stored; the headquarters
address must **not** be added to the website.
Still blank (highlighted `[brackets]` in the drafts): item 4 attachment (Pace's signed confirmation), item 5 (Pace employee, only with that person's agreement), item 8 (insurance certificate or
an honest "in progress" wording), and in the statement the period for "other travel details".
**Where they are:** `docs/handoff-artifacts/diana-verification/` holds `Reply_to_Diana_plain_text.txt` (the version to send), `WBM_Data_Protection_and_Passport_Handling_Statement.pdf`,
`Pace_Appointment_Confirmation_Letter_TEMPLATE.pdf`, and `build-documents.mjs` (rebuilds both PDFs: `node docs/handoff-artifacts/diana-verification/build-documents.mjs`; needs Playwright and
the fonts in `public/fonts/pdf`). They contain the creator's first name, the Illinois registration number and the headquarters address. **The owner knowingly approved committing them to this
repository on 2026-11-08 after being told the repository is public** (checked via the GitHub API). Do not copy those details into other public places (the website, issues, pull requests).

**8. Deleting test accounts and data (NOT done; blocked).** The owner wanted every account that is not staff/admin removed, plus
one stray contact enquiry and Earl's voice note, because the site is now being used for real. Live data found on 2026-10-15 (read only):
staff accounts only plus one other account (a non-staff account, called "the extra account" below, with one invoice `INV-C4121DF7`, one chat message, one assignment to Youssef, and
one PDF at `client-documents/<that account's email>/invoices/INV-C4121DF7.pdf`); one contact enquiry from a person with no account (form_submissions id
`a96d3228-4425-4fba-871b-079310075130`, 2026-10-08, no account); Earl's "Voice note (0:11)" (client_messages id `2dbf5c02-942b-4232-af10-ced217f7d4f0`,
audio file `chat-voice/<Earl's email>/1791820262764.webm`). Earl's own invoice `INV-61170A1A` and his account are to stay, as are Ravi and Youssef.
The Supabase SQL tool used in this environment **times out on any DELETE** (nothing was removed; re-checked). The owner said he would delete the extra account himself
with the staff page's "Delete account" button (it also removes his invoice, files, messages and assignment). For that enquiry and Earl's voice note the owner
was given two SQL lines to paste in the Supabase SQL editor (`delete from public.form_submissions where id = 'a96d3228-4425-4fba-871b-079310075130'; delete from public.client_messages where id = '2dbf5c02-942b-4232-af10-ced217f7d4f0';`)
and told to delete the `.webm` in Storage -> `chat-voice` by hand. **Whether the owner did any of this is unknown.** Re-check with a read-only query
(`select email from auth.users`; `select count(*) from public.form_submissions`; `select count(*) from public.client_messages`).

**9. Other findings recorded this session.**
- The public **Privacy Policy** (`src/app/privacy/page.tsx`) is generic: it says nothing about passports, retention, where data is hosted or the data controller,
  and it still says the site does not process card payments (card payments now exist). The owner has not yet said yes to a rewrite.
- The contact page still shows the literal placeholders "[ADDRESS TO BE PROVIDED]" and "[BUSINESS HOURS TO BE PROVIDED]" (`src/app/contact/page.tsx`).
  The owner said do not put the headquarters address on the site, so the address placeholder was left as is.
- The street address the owner supplied for the headquarters mixes a building name with a street number that did not look consistent to the assistant; the owner was asked to check it against the Illinois filing because the creator is verifying WBM.
- The GitHub Pages preview is stale (section 1).

---------------------------------------------------------------------------------------------------------------------

## 3. Decisions made by the owner (in the owner's words where possible)

- "I need the random invoice number, not same invoice number" (resolved: invoice numbers were already random and stay fixed; only the ePayVista reference is new per checkout).
- Hide Tawk's green bubble everywhere; our own button opens the window and returns when it is closed.
- Use the Pace Mudlarkers photo exactly as uploaded: "there's no need to crop it".
- "I need every exhibition ... detailed page", with the official link going to that exact show.
- Creators' email: "don't tell them anything about Ravi ... just use his link to open the exhibition page ... it should be a button ... remove the Pace gallery websites"; no date-choosing language; use the site's own automatic-email template; do not put it in GitHub or on the site (so only the builder lives in `docs/handoff-artifacts/` as an archive now, by the standing instruction).
- Travel authorisation: UK form is the main one, "other destination" a separate one ("Yes, I think differently works better"); one page; client signs on screen; whatever is pre-filled the client can edit; corrections must update the profile; destination follows the exhibition; costs-covered-by defaults to Pace Gallery; Earl's signature is automatic on every form.
- "Don't merge yet ... I will give you go ahead to merge" (latest instruction on merging; applies to the passport-email change).
- WhatsApp: add it, with a preview message; it is the Client Services number, not Ravi's.
- Remove the "what would you like us to arrange?" question.
- The blurred band under the header "doesn't look good ... you have to do it well" (led to the gradient shade).
- The due-diligence reply: "we are sending it in plain text, not HTML"; Earl signs it; retention "14 days after the trip has been confirmed"; do not name hosting suppliers in the documents; do not add the headquarters address to the site.
- Delete test accounts/data: all non-staff accounts, the stray contact enquiry, Earl's voice notes (keep Earl's account and invoice, and all staff) (see item 8: not done).
- "Everything you do ... must be saved to GitHub" (this file and section 0).

---------------------------------------------------------------------------------------------------------------------

## 4. Current state

| Area | State |
|---|---|
| Travel Authorisation Form (staff send, client fills in and signs) | Merged and live; database set up; **not yet used by a real client** |
| Footer iPad fix, WhatsApp links, arrange question removed, header fixes (#86 to #90) | Merged and live (verified on the real site after each merge) |
| Passport/attachment email fix | Functions **deployed live**; repo change on branch `claude/no-passport-in-email` (d4835da), **PR not opened, not merged** |
| Due-diligence reply + statement + Pace letter template | Drafted and in `docs/handoff-artifacts/diana-verification/`; not sendable until the blanks in item 7 above are filled |
| Creators' "Plan your trip" email | Finished; archived in `docs/handoff-artifacts/creators-email/` (reconstructed copy) |
| Test-account and test-data deletion | **Not done** (tool blocked); owner said he would do the account himself |
| Privacy Policy rewrite | Not started (awaiting owner's yes) |
| Old draft PRs #75, #76, #77 | Still open as drafts on GitHub (opened 2026-10-13). Their features appear to be in `main` already (`MoneyPanel.tsx`, `orderReceiptPdf.ts` exist), so they look stale; confirm and close |
| GitHub Pages preview | Stale (2026-09-28) |
| Handoff branch | This file and `docs/handoff-artifacts/` are on branch `claude/handoff`; not merged into `main` unless the owner said "merge" |

---------------------------------------------------------------------------------------------------------------------

## 5. Open items and who they wait on

Waiting on the **owner**:
1. Say "merge" for the passport-email change (the assistant then opens the pull request, checks CI, squash-merges, and confirms live).
2. Say "merge" (or not) for this handoff branch so `HANDOFF.md` reaches `main`.
3. The due-diligence reply's blanks: Pace's signed letter or the "confirm with your own contact at Pace" wording only; the Pace employee's name and @pacegallery.com email
   (with that person's agreement) or "we have asked Pace to confirm to you directly"; the insurance certificate details or "in progress" wording; a period for
   "other travel details" (the `[12 months]` placeholder; or match the passport rule).
4. Clarify the retention wording: does "14 days after your trip has been confirmed" mean when the booking is confirmed, or after the trip is completed?
   As written it can read as deleting passport details before the trip happens.
5. Check the supplied street address against the Illinois filing and say whether the registered office differs from the headquarters.
6. Delete test data (item 8 above) and tell the assistant when done.
7. Decide on the Privacy Policy rewrite (the assistant recommends one).
8. Real-world checks only the owner can do: send the Travel Authorisation Form once to a test client; a real card payment (tap Pay twice); push notifications on a phone;
   non-admin staff login; the chat button on a phone; confirm Thea Djordjadze's end date.
9. Decide whether to revert PR #90 (it was merged just before "don't merge yet"; visual only).

Waiting on **the assistant** (needs GitHub tools or a new session):
10. Open the pull request for `claude/no-passport-in-email` once told to merge it, watch CI, merge, verify.
11. Fix the three exhibition listings that still link to generic venue pages.
12. Optional: counsel should confirm the "transfers outside the EU" wording in the statement (the owner's team works from the US; the statement makes no claim about a legal safeguard).

Waiting on **someone else**: Pace Gallery (signed confirmation, employee consent), the insurer (certificate), counsel/accountant (optional reviews).

---------------------------------------------------------------------------------------------------------------------

## 6. Next steps, in order

1. Read this file and `docs/handoff-artifacts/README.md`. Run `npm ci && npm test` to confirm the suite passes on a clean checkout.
2. Check the open questions in section 5 with the owner (items 1 to 9). Do not merge anything without the owner saying "merge".
3. When told to merge the passport-email change: open the PR from `claude/no-passport-in-email`, wait for the CI `verify` check, squash-merge, confirm `main` has the
   files, and re-read the deployed functions (`get_edge_function`) to confirm they still match the repo (they were deployed from these files on 2026-10-15).
4. Finish the due-diligence reply with the owner's answers (files in `docs/handoff-artifacts/diana-verification/`), rebuild the PDFs with `build-documents.mjs`, and let the owner send it.
5. Re-check the test-data deletion state with the read-only queries in item 8.
6. If the owner agrees, rewrite `src/app/privacy/page.tsx` to match `WBM_Data_Protection_and_Passport_Handling_Statement.pdf` and the real payment methods.
7. Keep this file current and push at the end of the session (section 0).

---------------------------------------------------------------------------------------------------------------------

## 7. Technical notes and gotchas for the next assistant

- **Supabase SQL tool and DELETE:** it times out on every `delete` statement (and the owner's rule is no drop/delete via that tool). Use the staff page's admin "Delete account"
  (edge function `staff-client-action`), or give the owner SQL to run in his own dashboard. Soft changes (`update`) work.
- **Deploying edge functions:** use the Supabase deploy tool with every file the function imports (the function's `index.ts`, plus `_shared/email.ts`, `_shared/push.ts`,
  `_shared/privacy.ts` as needed) under names like `supabase/functions/<name>/index.ts` and `supabase/functions/_shared/<file>.ts`, `entrypoint_path` the function's `index.ts`.
  **Always compare with the deployed version first** (`get_edge_function`): on 2026-10-15 the live `notify-*` functions were older than the repo.
- **Migrations:** the SQL file in `supabase/` is the record; applying it live is a separate step (done for `travel-auth-requests.sql` on 2026-10-15). Avoid `drop` in SQL run through the tool (it can be blocked); use `create or replace` and "add policy if missing" blocks.
- **PDFs:** built in the browser with jsPDF and embedded Montserrat (`src/lib/invoicePdf.ts` exports `FONT_FILES`, `loadPdfFonts`, `loadEmblem`). Tests load `src/lib` through `tests/helpers/pdf.mjs`. jsPDF cannot read a compressed 3-bit palette PNG; use 8-bit grayscale+alpha or RGBA PNGs.
- **Signature handling:** staff signature image is only in the database; the PDF builder reads it from the request row (`signer_signature`), and `company_signer()` for the staff panel.
- **Email template:** `supabase/functions/_shared/email.ts` (`layout`, `FONT`, `Signature`); a custom signer can be passed as the second argument to `layout`.
- **Hero images:** `PageHero` renders `HeroBlurTransition` (now a gradient) inside the image container; the heading `Container` must stay `relative z-20`.
- **Playwright/QA:** see `docs/handoff-artifacts/qa-scripts/README.md`.
- **Pronouns:** use "they" for anyone whose pronouns the owner has not stated.
- **Sandbox quirk:** the scratch folder used during a session can be wiped between sessions (it was on 2026-11-08). Anything that matters goes in git, not only on disk.

---------------------------------------------------------------------------------------------------------------------

## 8. Files created or changed in this session (repo paths)

Merged into `main` (PRs #85 to #90): `supabase/travel-auth-requests.sql`; `src/lib/travelAuthPdf.ts`, `travelAuthData.ts`, `travelAuth.ts`, `whatsapp.ts`, `place.ts`;
`src/components/account/SignTravelAuthDialog.tsx`, `TravelFormRows.tsx`, `DocumentsToDo.tsx`, `DocumentsPanel.tsx`; `src/components/ui/SignaturePad.tsx`;
`src/components/staff/TravelAuthSender.tsx`, `ClientHub.tsx`; `src/components/layout/Footer.tsx`, `FooterAccordion.tsx`, `NavOverlay.tsx`, `PageHero.tsx`, `HeroBlurTransition.tsx`;
`src/components/home/Hero.tsx`; `src/components/cards/ArtListingCard.tsx`, `CalendarEntryCard.tsx`, `CulturalAccessCard.tsx`; `src/components/specialty/ArtListingDetail.tsx`;
`src/components/forms/TravelDetailsForm.tsx`; `src/app/contact/page.tsx`; `src/app/globals.css`; `src/data/company.ts`;
`tests/travel-auth.test.mjs`, `tests/whatsapp.test.mjs`, `tests/place.test.mjs`.

On branch `claude/no-passport-in-email` (not merged): `supabase/functions/notify-client-activity/index.ts`, `supabase/functions/notify-form-submission/index.ts`,
`supabase/functions/_shared/privacy.ts`, `tests/privacy.test.mjs`.

On branch `claude/handoff` (this commit): `HANDOFF.md`, `docs/handoff-artifacts/` (README, `diana-verification/`, `creators-email/`, `qa-scripts/`, `recover-files-from-session-transcript.py`).

Live database/functions changes made outside git (recorded here because they are not visible in the repo): migration `travel_auth_requests` applied; one row in
`company_signature` (name "Earl Anderson", title "Founder & Chief Executive Officer", signature image); edge functions `notify-client-activity` v11 and `notify-form-submission` v13 deployed.

---------------------------------------------------------------------------------------------------------------------

## 9. About this repository being public

On 2026-11-08 the GitHub API showed `Kushams/world-bridge-meridian-website` is **public** (and Cloudflare deploys the live site from it). The owner was told, and chose to commit the due-diligence
documents anyway. Things that are still deliberately **not** in git, whatever the visibility:
- The company signature image (it is in the database only).
- Any API keys, tokens, passwords or `.env` files (secrets live in Supabase function secrets and the owner's accounts).
- Staff members' personal email addresses and clients' contact details.
Consider making the repository private: it would remove the exposure of the due-diligence details above. The live site would need a different way to build (Cloudflare Workers Builds can still connect to
a private repository, but check the connection first).
