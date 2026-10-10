# Weekly events refresh routine

Create this as a Routine (claude.ai → Routines → New), same repo as the exhibitions routine.

- Name: Weekly world events refresh — World Bridge Meridian
- Schedule: weekly, Mondays 16:11 UTC (cron `11 16 * * 1`)
- Each run starts a fresh session
- Repo: Kushams/world-bridge-meridian-website (push access)

## Prompt

You are refreshing the Events content on the World Bridge Meridian travel website (GitHub repo: Kushams/world-bridge-meridian-website, branch main). The owner (Kushams) gave standing permission, mirroring the existing weekly exhibitions routine, to do this autonomously every week: research, update, and push directly to main with no confirmation and no PR.

STEP 0 (REQUIRED): call the `add_repo` tool (claude-code-remote MCP server; load it via ToolSearch if needed) with owner "Kushams", repo "world-bridge-meridian-website", access "push". Follow the clone command it returns, then call `register_repo_root`. If add_repo is denied or the push later fails, send a push notification to the owner with the exact error and stop; never end silently.

Context: `src/data/events.ts` holds a hand-curated list of REAL, officially-dated events (shape: slug, category convention|professional|sporting|music-festival|food-wine|tech|film|design|fashion|cultural, title, organizer, venue, city, country, startDate, endDate (YYYY-MM-DD; endDate = startDate for one-day events), description, sourceUrl, sourceLabel, heroImage). The /events page (src/components/specialty/EventListingsPage.tsx) shows upcoming events and automatically moves anything past its endDate into a collapsible "Past Events" archive, with region and type filters. The site is static (Cloudflare, deploys from main), so this file only stays accurate if re-researched and re-pushed weekly.

Goal each run: keep a rolling list of the top events people are anticipating, in every part of the world, for roughly the next 12 months. Keep a spread across North America, South America, Europe, Middle East & Africa and Asia-Pacific, and across categories: sport (F1, Grand Slams, marathons, golf majors, rugby/football/cricket tournaments), festivals and carnivals, film festivals, music festivals, technology, design, fashion, food and drink, cultural celebrations, and industry shows. If a region is thin, add its flagship events first.

Each run:
1. Read `src/data/events.ts` and EVENTS_LAST_VERIFIED. Run `npm install`.
2. Never invent or guess a title or date. Only add events with a CONFIRMED start AND end date taken from the organizer's own official site (WebFetch the official page; use WebSearch with allowed_domains to find it). Third-party listing sites are not sufficient. Skip anything you cannot date from the official source.
3. Add newly announced or newly confirmed events (aim for 10-25 new verified entries per run, prioritising events starting in the next ~6 months). Re-check existing upcoming entries and fix any dates that changed or events that were cancelled/postponed (say so in the description). NEVER delete finished or past entries: the owner wants them kept so the "Past Events" archive keeps growing. Update EVENTS_LAST_VERIFIED to today (YYYY-MM-DD).
4. heroImage: reuse a photo that matches the event: an existing unsplashPhoto("...") id already used in src/data (for example a destination's heroImage in src/data/destinations.ts for the host city, or an existing photo of the same sport/festival type in events.ts). Never guess or invent Unsplash photo ids. If you cannot find a matching existing photo, use the host city's destination photo, or leave the entry out until a matching photo exists.
5. Run `npm run lint`, `npx tsc --noEmit` and `npm run build`; fix anything broken before pushing.
6. Commit with a clear message (what was added, which events/regions) and push directly to main. If nothing changed, make no commit.
7. After pushing, verify with `git ls-remote origin main` that the remote head matches your commit.

Standards: no claimed partnerships or affiliation with any event, organizer or venue; always link to the primary source (sourceUrl = official site). Keep descriptions factual and short, only stating what the official source states.
