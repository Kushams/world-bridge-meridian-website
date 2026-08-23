# World Bridge Meridian — Website & Digital Travel Platform

**World Bridge Meridian** is an independent global travel company, founded in 2012 by
Earl Anderson. This repository contains its marketing website and digital travel
platform: a premium, editorial, multi-page site covering destinations, travel
packages, cruises, experiences, and a bespoke journey-planning flow.

World Bridge Meridian is not a conventional travel agency — the company designs,
curates, and coordinates journeys around the traveler, working with external
airlines, hotels, cruise operators, and cultural organizations as needed. This site
reflects that positioning throughout: it favors "plan your journey" / "request this
journey" language over transactional "book now" language, and never claims live
inventory, availability, or partnerships that have not been verified.

## Routes

- `/` — homepage
- `/explore`, `/destinations`, `/destinations/[slug]`
- `/travel-packages`, `/travel-packages/[slug]`
- `/cruises`, `/cruises/[slug]`
- `/experiences`, `/experiences/[slug]`
- `/current-journeys`, `/stays`
- `/bespoke`, `/arts-culture`, `/luxury-travel`, `/family-travel`, `/couples-travel`,
  `/group-travel`, `/corporate-travel`
- `/about`, `/leadership`, `/partners`, `/reviews`
- `/journal`, `/journal/[slug]`, `/faq`, `/contact`
- `/plan-your-journey`, `/my-world-bridge`
- `/privacy`, `/terms`, `/cookies`
- `/sitemap.xml`, `/robots.txt` (generated from `src/app/sitemap.ts` / `robots.ts`)

## Design system

The visual identity is a fixed dark, editorial-luxury palette (charcoal/ink
background, ivory type, a restrained gold accent) — see the design tokens in
`src/app/globals.css` (`@theme` block) and the shared primitives in
`src/components/ui/` (`Button`, `Container`, `SectionHeading`, `Reveal`,
`Breadcrumbs`). Display type is Fraunces (serif); body/UI type is Inter — both
loaded via `next/font/google` in `src/app/layout.tsx`.

## Technology stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- Structured TypeScript data collections under `src/data` (no CMS/database yet —
  see [Content architecture](#content-architecture) below)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint     # eslint
```

## Environment variables

The site currently has no required environment variables — there is no live backend,
booking, or payment integration yet. `.env.example` documents variables that future
integrations (email delivery, CRM, payment providers) will need; copy it to `.env.local`
and fill in real values only when wiring up that integration. Never commit `.env*`
files with real secrets — they are excluded via `.gitignore`.

## Content architecture

All editorial content — destinations, travel packages, cruises, experiences, travel
styles, current journeys, stays, reviews, partners, team members, and journal
articles — lives as structured TypeScript objects in `src/data/`, one module per
collection, exporting a typed array. Pages read from these collections rather than
hard-coding content, so the site can scale to hundreds of entries without changing
page code.

### Adding a destination

Add an entry to `src/data/destinations.ts` following the existing `Destination` type
(slug, country, region, images, description, travel styles, indicative pricing,
etc.). The route `/destinations/[slug]` renders automatically from the `slug` field —
no new page file is needed. The site currently ships with 55 destinations across
five regions — past the 50-destination starting target — with real, distinct
content for each; growing further toward 100+ is purely a content task — the
architecture, filtering, search index and detail-page template already support
it without any code changes.

Placeholder imagery is organized by visual theme in `src/data/images.ts`
(`IMAGE_BANK`) — every image ID in that file was fetched and visually reviewed
before being categorized, so pulling from a theme (e.g. `themeImage("coastal", 2)`)
reliably returns an on-theme photo. Swap entries there, or a destination's own
`heroImage`/`gallery` fields, for official photography before launch.

### Adding a travel package, cruise, or experience

Same pattern: add an entry to `src/data/packages.ts`, `src/data/cruises.ts`, or
`src/data/experiences.ts`. Each collection's detail route reads the matching `slug`.

### Updating reviews, partners, journal articles, or company information

- Reviews: `src/data/reviews.ts` — every sample entry is explicitly labeled as a
  sample testimonial. Replace with verified client reviews before launch, keeping the
  same shape.
- Partners: `src/data/partners.ts` — until real partners are confirmed, entries stay
  generic ("Selected hospitality and travel partners"). Do not add named partners
  without written confirmation.
- Journal articles: `src/data/journal.ts`.
- Company-wide facts (founding year, founder, contact email, etc.) live in
  `src/data/company.ts` as a single source of truth — update there rather than
  hard-coding strings across pages.

### Gallery exhibitions, museum exhibitions and art fairs

`/exhibitions`, `/museums` and `/art-fairs` list real, currently-running or
upcoming shows at major galleries, museums and art fairs worldwide, sourced
from `src/data/exhibitions.ts`. Unlike the rest of the site's content, **this
data goes stale on its own** — shows close and fairs move, and this is a
static site with no live backend to refresh it automatically. Every entry:

- was checked against the institution's own website before being added
  (`sourceUrl` links straight back to it so it stays verifiable);
- is stamped with `LAST_VERIFIED` in that file, shown on each page;
- does not claim any partnership or affiliation with the gallery, museum or
  fair — it's public information about what's on, offered because we can
  help plan travel around it.

Re-check and refresh `src/data/exhibitions.ts` against primary sources
regularly (at minimum, before each listed show's end date passes) — do not
let stale "currently on view" listings sit indefinitely.

### Sample / indicative data

Cruise departures and current-journey listings are **sample data** pending live
supplier integration, and are labeled as such in the UI (`Sample Journey`,
`Indicative Journey`, etc.). Do not remove those labels without connecting real,
verified supplier data.

## Pricing

All prices shown on the site are indicative starting prices, not guaranteed booking
prices. See `src/data/company.ts` for the shared pricing disclaimer text used
across package, cruise, and destination pages.

## Deployment

The project builds as a standard Next.js app and can be deployed to any Next.js-
compatible host (e.g. Vercel). No deployment pipeline is configured in this
repository yet.

## Future integrations

The codebase is structured so the following can be added later without a rewrite:

- Live hotel / airline / cruise supplier data (replacing `src/data/cruises.ts` and
  the current-journeys sample data)
- A CRM / email pipeline behind the "Plan Your Journey" enquiry form
  (`/plan-your-journey`), which currently only validates and confirms client-side
- Customer accounts / authentication behind `/my-world-bridge`
- Payment processing (cards, bank transfer, and — once a compliant provider is
  selected — cryptocurrency), via a legitimate, PCI-compliant, server-side payment
  processor. No payment form or checkout exists yet; do not fake one.

## Git workflow

Work happens on feature branches; the default branch is `main`. Commit at each
meaningful checkpoint and push to GitHub — GitHub is the primary backup for this
project.
