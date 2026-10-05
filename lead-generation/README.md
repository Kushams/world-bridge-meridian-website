# WBM Lead Generation

A structured, source-backed, continuously growing **prospect database** for World Bridge Meridian (WBM).

> **This system does not send email.** It contains no SMTP, no mailer, no campaign or sequence logic and makes no
> network calls. It discovers, organises and exports prospects; WBM's separate outreach process decides what to do
> with them. (A test, `scripts/tests/leads.test.mjs`, fails if network or mail code is ever added to the scripts.)

## What it does and how it relates to WBM

WBM is a global journey company serving individuals, groups, organisations and travel partners. Anyone can
potentially travel, so the database is built in two layers that are always labelled:

1. **Broad prospects** - relevant people/organisations with no known current travel requirement.
2. **Intent prospects** - a publicly observable travel signal, with the evidence recorded.

The module lives inside the website repository but is **independent of the website**: nothing under
`src/` imports it, the Next.js build does not touch it, and it has no runtime dependencies (Node 22+, built-ins only).

Pipeline: `discover -> collect -> normalise -> enrich -> classify -> deduplicate -> segment -> store -> export`,
stopping before outreach. The operating rules (no invented data, no guessed emails, public sources only, privacy,
destination as a field not a campaign) are in [`docs/MASTER_PROMPT.md`](../docs/MASTER_PROMPT.md).

## Directory structure

```
lead-generation/
├── README.md
├── config/                 non-secret settings (countries, pipelines, dedupe, validation, output, search plan)
├── schemas/                lead.schema.json, opportunity.schema.json, SCHEMA.md (field documentation)
├── scripts/                CLI tools + lib/ + tests/
├── data/
│   ├── master/master_leads.csv          SOURCE OF TRUTH for all leads
│   ├── seasonal/opportunities.csv       SOURCE OF TRUTH for seasonal / event opportunities
│   ├── b2c/{broad,intent}/ b2b/ travel-industry/ concierge-luxury/ events-weddings/
│   │   arts-culture/ institutional/ cruise/ group-travel/ strategic-partners/
│   │                                    DERIVED per-pipeline files (git-ignored)
│   └── incoming/                        staged batches + rejected records (git-ignored)
├── exports/                DERIVED exports for the outreach team (git-ignored)
└── reports/                run reports and master summaries (counts only, committed)
```

`concierge-luxury/` is an addition to the originally sketched layout so that every master segment has a home.

## Source of truth

**`data/master/master_leads.csv` is the only place a lead is edited** (by running ingest). Everything else -
segment files, exports, JSON - is generated from it and git-ignored, so the same lead can never be modified in two
places or drift into conflicting copies. Segment files are named `<pipeline>.csv` (or `<pipeline>__<country>.csv`
with `--by-country`). The master is currently **empty (header only)**; no leads have been discovered yet.

### Where real lead data lives (read before the first discovery run)

The repository is **public**. A populated `master_leads.csv` holds names, emails and phone numbers of real people.
Do not commit a populated master to a public repo without an explicit decision (private repository, a private
data branch/submodule, or encrypted storage). Derived files, staged batches, rejected records and exports are
git-ignored; run reports contain counts only. Raise this before the first run that writes real prospects.

## Schema

44 columns, fully documented in [`schemas/SCHEMA.md`](schemas/SCHEMA.md) and defined in
[`schemas/lead.schema.json`](schemas/lead.schema.json): identity, person, organisation, geography, classification
(`pipeline`, `customer_type`, `campaign`, `intent_class`, `intent_type`, `travel_category`, `destination_interest`,
`seasonal_opportunity`, `event_opportunity`, ...), source (`source_url`, `source_type`, `discovery_date`,
`evidence`, `intent_evidence`) and database fields (`duplicate_key`, `lead_status`, `source_history`, ...).
Unknown = blank. Never guess.

## Campaign and geographic segmentation

- **Pipelines** (`pipeline` column): `B2C_BROAD`, `B2C_INTENT`, `B2B_CORPORATE`, `TRAVEL_INDUSTRY`,
  `CONCIERGE_LUXURY`, `EVENTS_WEDDINGS`, `ARTS_CULTURE`, `INSTITUTIONAL`, `CRUISE`, `GROUP_TRAVEL`, `STRATEGIC_PARTNERS`.
- **Campaign** = pipeline + country + intent class, e.g. `B2C Broad | USA | Broad Prospect`,
  `B2C Intent | UK | Travel Intent`, `Travel Industry | Germany | Broad Prospect`.
- **Geography** is a field, not a folder. USA, Canada and UK are separate markets; Europe and Asia are separated by
  country; Australia is separate; Africa is incidental (not actively prospected). See `config/countries.json`.
- **Destination is a data field** (`destination_interest`), never a primary campaign.

## Deduplication

Every run loads the existing master first. Each record gets keys in priority order (`config/dedupe.json`):

1. `email:` exact email match (case-insensitive)
2. `profile:` same public profile URL
3. `person:` same person + same company (legal suffixes like Ltd/GmbH ignored)
4. `org:` (organisation records) same organisation + same website host / phone

A new record matching **any** key is a duplicate. Duplicates are **not appended**; they only **fill blank fields** of
the existing record, append the new source to `source_history`, and bump `last_updated`/`lead_status`. Existing
values are never overwritten (differences are counted as conflicts in the run report). Different emails at the
same company are different contacts and stay separate (linked through `existing_match`). Re-running the same batch
adds nothing.

## How to run

Requires Node 22+. No installs needed for these scripts. From the repository root:

```bash
npm run leads:test                         # unit tests for the whole pipeline
npm run leads:validate                     # validate the master (exit 1 on errors; --strict fails on warnings)

# After a discovery run has produced a staged batch (CSV/JSON/JSONL using the schema's column names):
npm run leads:ingest -- lead-generation/data/incoming/batch.csv --dry-run   # preview
npm run leads:ingest -- lead-generation/data/incoming/batch.csv             # normalise -> validate -> dedupe -> append -> report
npm run leads:ingest -- seasonal.csv --dataset opportunities                # seasonal / event opportunities

npm run leads:segment -- --by-country      # regenerate derived per-pipeline files
npm run leads:export -- --format excel --country UK --pipeline TRAVEL_INDUSTRY --has-email
npm run leads:report                       # whole-master summary
```

CSV and Excel exports are split into files of at most 500 rows (`_part001.csv`, ...; change with `--batch-size N`, `0` = one file). Export formats: `csv` (UTF-8, Google Sheets / databases), `excel` (UTF-8 BOM + formula-injection protection),
`json`, `jsonl`. Filters: `--pipeline`, `--country`, `--status`, `--intent`, `--campaign`, `--has-email`.

Ingest rejects a record (and lists it in `data/incoming/rejected_<run>.json`) when it fails validation: missing
source/date/country/pipeline, no contact route, a generic inbox attached to a named person, intent claimed without
evidence, invalid email/URL/date, a lead with no usable dedupe key, etc. `OUT_OF_SCOPE` records are counted and
not stored. Unknown input columns abort the run unless `--ignore-unknown` is passed.

### Typical discovery run (done by Claude Code, per the master prompt)

1. Read `config/` and the current master summary (`npm run leads:report -- --print-only`) to see gaps.
2. Collect real, public, source-backed records into `data/incoming/<name>.csv|json`.
3. `leads:ingest --dry-run`, review, then `leads:ingest`.
4. `leads:validate`, `leads:segment`, `leads:report`; commit the master and the run report (subject to the data-location decision above).

## Reports

- **Per run**: `reports/run_<timestamp>.md` and `.json`, written by `ingest` - date, records in, new, duplicates
  (and how many enriched), invalid, out of scope, with/without email, countries / pipelines / campaigns /
  intent classes covered, sources used, issue-code counts, coverage gaps, missing-field rates, problems.
- **Whole master**: `reports/master_summary_<date>.md` from `npm run leads:report` - totals, by pipeline /
  country / Europe / Asia / intent / status, **source performance** (actual counts, % with email, % ready, no
  "best source" claims) and gaps that feed the next cycle.

Reports contain counts and row numbers only, never names or emails.

## What must never be committed

API keys, SMTP or OAuth secrets, Supabase service-role keys, private tokens, passwords, credentials, `.env*`
files with real values, and any leaked/stolen/purchased-without-rights data. If a future step needs credentials
(a search API, enrichment API), read them from environment variables only; planned names are listed in
`config/search.json` (`WBM_LEADGEN_USER_AGENT`, `WBM_SEARCH_API_KEY`; none required today). `lead-generation/.gitignore`
blocks derived data, staged batches, exports, `.env*`, keys and credential files.

## Data-collection rules (summary)

Public, legitimately accessible sources only; no authentication bypass, CAPTCHA circumvention, fake accounts,
private/leaked data. No sensitive personal data (health, religion, politics, finances, family) and no personal
scoring. Respect robots.txt and applicable privacy / electronic-marketing law (GDPR/PECR, CAN-SPAM, CASL...).
Never invent or pattern-guess data. Volume never justifies fabrication.

## Collectors and recurring discovery

`collectors/` is the only place network access is allowed. It is separate from `scripts/` (which stays network-free) and
contains no email-sending code (a test enforces this).

1. `collectors/probe.mjs <domains...>` fetches standard public contact pages and records the addresses literally published
   there (Cloudflare-obfuscated ones decoded as a browser would). It never guesses, logs in or submits forms. Results are cached in
   `data/incoming/probe_cache.jsonl` (git-ignored).
2. `seeds/*.txt` holds one row per organisation: `domain|Company|City|Country|PIPELINE|type|use case`. Add a row only for facts you can
   verify; leave City blank if unsure.
3. `collectors/build_batch.mjs` joins probe results and seeds into `data/incoming/batch_<date>.json`, choosing one generic business
   inbox per organisation (groups, corporate, events, VIP, info). Named-person, ticketing, membership and press inboxes are never chosen.
4. `npm run leads:ingest -- lead-generation/data/incoming/batch_<date>.json` dedupes, validates, appends and writes the run report.

### Who to target

WBM wants **individual people** who might travel. `config/targeting.json` excludes every business/organisation record
(`lead_type` ORGANIZATION), travel sellers, and arts/culture bodies (WBM sends its own clients to them). Ingest counts matches
as OUT_OF_SCOPE and `npm run leads:prune` removes any already in the master. Individuals must come from sources that allow
marketing contact (for example opt-in sign-ups through the website forms, with consent recorded).
Collecting personal or staff emails from social profiles or team pages is not done by this system.

### Batches of 500

`npm run leads:batches` writes every **complete** block of 500 master leads to `data/batches/wbm_leads_batch_NNNN.csv`. Batch files are
committed to GitHub as frozen snapshots, never overwritten, and handed to the outreach team. Leads beyond the last full block wait for the
next batch. Run it after each ingest; the new files are the ones to send.
