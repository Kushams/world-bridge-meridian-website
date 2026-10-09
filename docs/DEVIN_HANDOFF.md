# Handoff for Devin: finish the Supabase side and verify the live site

> **Access and keys.** The owner keeps their keys saved in **Devin's own Secrets / environment variables** (not in
> this repo), so you should already have them. **First, check which of these you can read** (names only, never print
> values) and list any that are missing:
>
> | Secret name | Used for |
> |---|---|
> | `SUPABASE_ACCESS_TOKEN` | Supabase management API / CLI (project `rkevnmqofvqdmjujlrvd`) |
> | `SUPABASE_DB_PASSWORD` or a Postgres connection string | running SQL |
> | `SUPABASE_SERVICE_ROLE_KEY` | RLS tests, reading `form_submissions` |
> | `RESEND_API_KEY` | email function secret and test sends |
> | `NOTIFY_SHARED_SECRET`, `TURNSTILE_SECRET_KEY` | edge function secrets |
> | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Workers/Pages deployments, build variables, Turnstile |
> | `GITHUB_TOKEN` (optional) | opening PRs for code fixes |
>
> If anything you need is missing, **stop and tell the owner exactly which secret name to add under Devin ->
> Settings -> Secrets**, and what permission/scope it needs. Do not ask them to paste values into chat. If you still
> cannot do a step, give the owner exact numbered instructions and wait for their confirmation.
> One firm rule: **never write any key, token or secret into the repo, a commit, a PR, a file or a log.** Put secrets
> only into Supabase function secrets / Vault or Cloudflare build variables.

## 0. Project facts

- Repo: `Kushams/world-bridge-meridian-website` (default branch `main`). Live site: https://worldbridgemeridian.com
- Stack: Next.js (a newer version than you may know: **read `node_modules/next/dist/docs/` before writing Next code**, see `AGENTS.md`), TypeScript, Tailwind. Built as a static export (`npm run build:cloudflare`, `STATIC_EXPORT=true`) and served from **Cloudflare** (Workers static assets). Netlify and the old GitHub Pages deploy are no longer used. Cloudflare builds from `main`.
- Backend: **Supabase** project `rkevnmqofvqdmjujlrvd` (eu-west-1), email via **Resend**, bot protection via **Cloudflare Turnstile**.
- Checks every change must pass: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Pull requests merged so far: #12 (exhibitions data), #13 (exhibition travel form), #14 (mobile pages, swipe rows, menu, Stays, planner, customer accounts), #16 (hero fixes: eyebrow no longer blurred, swipe-row left gutter, hero load animations and stats row removed), #15 (this file).

## 1. What was done (all merged to `main`)

### Exhibitions, museums, art fairs (`src/data/exhibitions.ts`)
- Refreshed with ~55 verified shows across David Zwirner, Gagosian, Hauser & Wirth, Pace, White Cube, Lisson, Thaddaeus Ropac, Perrotin, Marian Goodman, Sprüth Magers, Saatchi, Tate, The Met, Musée d'Orsay, Fondation Louis Vuitton, Louvre Abu Dhabi, M+, Mori Art Museum, plus fairs. `LAST_VERIFIED` is updated each run.
- **Owner decision: never delete closed shows.** Listing pages move anything past its `endDate` into a collapsed "Past Exhibitions" section, so the archive should grow.
- A weekly Claude Routine ("Weekly art exhibitions refresh — World Bridge Meridian", id `trig_01ENkuvrJTBxM4XEn9E6RUsM`, Mondays 15:17 UTC) researches and pushes new verified shows straight to `main`. The old routine failed silently for weeks because the repo was not attached to its session (git push 403). The owner has attached the repo and a test run succeeded. If it ever fails, the owner gets a push notification.

### Exhibition Travel Itinerary Form (`/travel-details-form`)
- Digital version of the owner's old paper "Travel Detail & Itinerary Form" (all 7 parts, rebranded from "Arts Abroad" to World Bridge Meridian). `noindex`. Prefilled from "Plan This Trip" buttons on exhibition, museum and art-fair cards.
- Goes through the existing pipeline: `src/lib/formSubmissions.ts` -> edge function `submit-form` (Turnstile check, service-role insert into `public.form_submissions`, `form_type = 'travel-details'`) -> DB trigger -> edge function `notify-form-submission` (Resend: email to `info@worldbridgemeridian.group` + confirmation to the traveler).
- It collects passport details per trip. Passport numbers are **not** stored in customer profiles (deliberate).

### Mobile / layout work (`claude/shorter-mobile-pages`, PR #14)
- Pages were up to 32 phone-screens long. Now mostly 2.5-5. Compact section spacing on phones, shorter heroes, tap-to-expand footer link groups, collapsible long sections on `/payments` (`MobileCollapse`).
- `SwipeRow` (`src/components/ui/SwipeRow.tsx`) turns card grids into swipe rows on every screen size (peeking next card, dots or "n / total", arrows on tablet/desktop, "Show all" on lists > 6). Desktop keeps the same cards-per-row as the old grids. Text of 50 pages was diffed against the live site: nothing lost.
- New menu (`NavOverlay`): sticky header, "Popular" tiles, tile links, **Journeys group open by default**, **Payments is its own group** (not under Contact). Header has a "Plan" pill on phones.
- Home: 10-step planner band under the hero (`PlannerBand`). The hero stats row and hero load animations were removed at the owner's request; scroll reveals remain.
- Stays (`/stays`): new "Top places to stay, around the world" section (`src/data/topStays.ts`, 48 named properties by continent, **Africa intentionally excluded**), clear "not affiliated, photos illustrative" note. Existing generic sample stays kept under "Stay Styles". Descriptions were written from general knowledge, **not individually fact-checked**.
- Journey wizard (`/plan-your-journey`, 10 steps) now also asks bed preference, dietary requirements, allergies; points art travelers to the exhibition form.

### Customer accounts (code merged, **database side NOT applied yet**)
- `/my-world-bridge` is now a dashboard: initials avatar, profile completeness bar, **My enquiries** (staff-set status track Received -> In review -> Proposal sent -> Confirmed / Closed), saved journeys, editable profile (name, phone, home city, nationality, contact preference, travel styles, interests, pace, bed preference, dietary, allergies), "Delete my account".
- Sign-in: password, **emailed sign-in link**, **forgot/reset password** (with confirm-password box), Show/Hide toggle, optional Google (hidden unless `NEXT_PUBLIC_GOOGLE_SIGNIN=true`).
- Journey wizard and exhibition form prefill from the profile; header and menu show the signed-in customer.
- Code: `src/lib/supabase/AuthProvider.tsx`, `src/components/account/*`, `src/app/my-world-bridge/page.tsx`.
- `AuthProvider` falls back to loading only `full_name, phone` if the new profile columns do not exist yet, so nothing breaks before you run the SQL.

## 2. Already applied to Supabase production

- Migration `allow_travel_details_form_type` (widens `form_submissions.form_type` check to include `'travel-details'`).
- Edge functions redeployed, version 3, `verify_jwt: true`: `submit-form`, `notify-form-submission`.

## 3. NOT yet done (your tasks)

1. **Run `supabase/profiles-enquiries.sql`** (safe to re-run). It: adds profile columns; adds `public.enquiry_status` enum + `form_submissions.status` / `status_updated_at` (+ trigger); creates `public.verified_email()`; adds the RLS policy "Customers read their own enquiries" (authenticated users may SELECT rows where `form_type <> 'newsletter'` and `lower(email) = public.verified_email()`). Claude's two attempts to apply it were cancelled by a permission gate, so it has not run.
2. **Deploy edge function `supabase/functions/delete-account`** (`verify_jwt: true`). It deletes the caller's own auth user via the service role; `profiles` and `saved_journeys` cascade. Past `form_submissions` rows are intentionally kept.
3. **Auth settings** (Supabase dashboard -> Authentication):
   - **"Confirm email" must be ON.** The enquiries policy relies on `email_confirmed_at`; if confirmation is off, anyone could register someone else's email, but `verified_email()` guards it, so also confirm it returns null for unconfirmed users.
   - Site URL = `https://worldbridgemeridian.com`; Redirect URLs include `https://worldbridgemeridian.com/my-world-bridge` (used by sign-up confirmation, sign-in link and password reset).
   - Check the confirmation / magic-link / recovery email templates read well and come from the right sender.
4. **Optional, only if the owner asks:** enable the Google provider (needs a Google OAuth client), then set `NEXT_PUBLIC_GOOGLE_SIGNIN=true` in the Cloudflare build environment.
5. **Verify the form pipeline end to end** (never confirmed with a real submission): submit `/travel-details-form` on the live site with Turnstile -> a `travel-details` row appears in `form_submissions` -> the team email arrives at `info@worldbridgemeridian.group` and the traveler gets the confirmation. Confirm function secrets exist: `RESEND_API_KEY`, `NOTIFY_SHARED_SECRET`, `TURNSTILE_SECRET_KEY`, and the Vault secrets from `supabase/hardening.sql` / `forms.sql`. Check whether `supabase/turnstile.sql` (drops the anon insert policy) has been applied; if not, tell the owner.
6. **RLS test matrix** for `form_submissions` after the SQL: anon sees nothing; a signed-in user with a confirmed email sees only their own non-newsletter rows; a user with an unconfirmed email sees nothing; no one but the service role can update `status`. Also confirm `profiles` RLS still limits each user to their own row.
7. **Staff workflow:** the owner will change each request's stage with the `status` dropdown in the Supabase Table Editor (they chose this over building an admin page). Optionally save a Table Editor view of recent `form_submissions` sorted by `submitted_at`. Do not build an admin page unless asked.
8. **Deploy check (owner does the Cloudflare part, see 3a):** ask the owner to confirm Cloudflare built `main` after PRs #14-#16. You can check by browsing the live site that `/`, `/stays`, `/payments`, `/exhibitions`, `/my-world-bridge` load on a phone, (the owner confirms the env vars in 3a). Run PageSpeed Insights on the home page and report mobile scores (local tests showed ~+4% JS and no slowdown, but real numbers were never measured).
9. **Real-account test:** sign up with a real test email -> confirm -> sign in -> edit profile (check it saves) -> submit a journey request with the same email -> see it under My enquiries -> change `status` in the Table Editor -> see the track update -> sign out -> "Email me a sign-in link" -> "Forgot password" -> delete the test account.

## 3a. Cloudflare steps (you do them with your saved Cloudflare token)

Use `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` from your saved secrets (needs Workers/Pages edit and Turnstile edit). If absent, tell the owner to add them. Then:

1. Workers & Pages -> the website project -> **Deployments**: confirm the latest deployment is built from `main`,
   shows **Success**, and is newer than the merge of PR #16. If it failed, read the build log, diagnose it, and fix
   through a PR (never push straight to `main`).
2. Confirm these **build variables** exist with non-empty values: `NEXT_PUBLIC_SUPABASE_URL`
   (`https://rkevnmqofvqdmjujlrvd.supabase.co`), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the project's anon/publishable key,
   readable in Supabase), `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `STATIC_EXPORT=true` if the build command needs it.
   Set any that are missing.
3. After adding or changing any variable, **trigger a redeploy**, because `NEXT_PUBLIC_*` values are baked in at build time.
4. Turnstile: confirm the widget's allowed hostnames include `worldbridgemeridian.com`.
5. Only if the owner wants Google sign-in: after you enable the Google provider in Supabase, add
   `NEXT_PUBLIC_GOOGLE_SIGNIN=true` to the build variables and redeploy.
6. Ask the owner to open the live site on their phone and check: the home hero (no blurred line, no stats row), swipe
   rows start with a small left gap, `/my-world-bridge` loads, then report back.

## 4. Owner decisions and constraints (please respect)

- **Do not store passwords in readable form** or in any table; Supabase Auth keeps hashes only. The owner asked for a saved confirm-password column and was told no; they accepted the confirm-password box instead.
- **No passport numbers in profiles.** They are entered per trip on the exhibition form only.
- Never delete closed exhibitions. No claimed partnership or affiliation with any gallery, museum, fair or hotel; link to primary sources.
- Keep the site fast: no new heavy libraries; images lazy-load.
- Don't merge or push anything to `main` that has not passed lint, typecheck and build. Open a PR for code changes.
- Tablet and desktop keep the wide card grids (now swipeable); phones should stay short.

## 5. Known gaps (not done)

- Stays descriptions need fact-checking; stock photos are illustrative, not of the properties.
- No email to customers when a request's status changes.
- Google sign-in is built but off.
- "Itineraries & Documents" in the account area is a "coming next" placeholder.
- SEO/AEO: the owner wants more visibility (e.g. Wikipedia). Claude advised against self-authoring a Wikipedia page (conflict of interest, notability); better routes are press coverage, Google Business Profile, Bing Places, Wikidata (after press), and adding the profile URLs as `sameAs` in the site's Organization structured data. Not done yet; needs the owner's profile URLs.

## 6. Report back

When finished, reply with: what you ran (SQL, functions, settings), the result of each test in section 3, anything that failed or looked wrong, and anything you changed beyond this list.
