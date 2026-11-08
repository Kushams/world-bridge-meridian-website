# QA scripts (Playwright walkthroughs)

Throwaway helpers used on 2026-10-15 to look at the site and to walk the new features end to end with a
**pretend** client and staff member. They are not part of the automatic test suite (`npm test`, files in `tests/`);
that suite is what runs on every pull request. These are for looking at screenshots.

How they work: they serve the static export in `out/` on a local port and drive it with Playwright (installed in
`/opt/node-tools`; Chromium in `/opt/pw-browsers`). Supabase is **mocked** (`https://mock.supabase.co/**`), so
nothing touches the real database. Build the export first, from the repo root:

    STATIC_EXPORT=true NEXT_PUBLIC_SUPABASE_URL=https://mock.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=anon npm run build

Screenshots are written under `/tmp/wbm-qa/` (changed from the old scratch folder). The Chromium path inside some
scripts (`/opt/pw-browsers/chromium-1194/...`) is from the old environment: the folder name changes with the Playwright
version (`ls /opt/pw-browsers`), so adjust it.

Status: recovered verbatim from the session transcript after the scratch folder was lost. Each one ran successfully on
2026-10-15 in its original form. They have NOT been re-run since recovery.

| Script | What it shows |
|---|---|
| `travel-auth-flow.mjs` | Staff sends the Travel Authorisation Form, client fills in and signs on screen, staff sees "Signed"; saves the signed PDF. Uses a stand-in 1x1 signature, never the real one. |
| `header-top-screenshots.mjs` | Zoomed screenshots of the top of photo headers (exhibition page, Contact, museums, home), phone and desktop. Argument: a label such as `before` or `after`. |
| `exhibition-header-screenshots.mjs` | The exhibition page header at 390, 360 and iPad width. Arguments: label, then page path. |
| `whatsapp-links.mjs` | Checks the WhatsApp links (contact page, an exhibition page, mobile footer) and takes screenshots. |
| `ipad-footer.mjs` | Footer at iPad mini / Air / Pro sizes, portrait and landscape: checks for overlap and sideways scrolling. |
