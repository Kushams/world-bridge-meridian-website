# WBM Motion Plan — the pictures, treated

Prepared 2026-11-23 from MOTION-REFERENCES.md. STATUS: awaiting the user's
go-ahead. Nothing in this plan is built yet.

## Principles

- Target: how PHOTOGRAPHS are presented across the site — hero imagery,
  destination and stay photos, photo cards, image-led sections.
- Motion and material only. Structure, content, function and brand
  (Montserrat, gold/cream/scrim palette) stay exactly as they are, except
  where a picture surface genuinely needs a change to carry a treatment
  (Pass 4 is the only structural one, and it is flagged).
- The bar: nothing basic. Every touched surface comes out sophisticated
  and alive with motion.
- The package's performance rules bind every pass: no backdrop-filter blur
  on moving or full-screen elements; transform + opacity entrances;
  transform-only cursors with zero layout reads; ambient loops pause under
  overlays; tilt rects cached on pointer-enter.
- No endless tickers anywhere (user taste ruling).
- Each pass: build → deploy → captures (desktop + phone) checked before
  reporting → live bundle verification → GitHub push with read-back →
  per-pass bundle snapshot kept, so any single pass can be reverted alone
  without touching the others. Passes land one at a time and are reported
  as they land.

## Pass 1 — Signature Stays & Journeys (homepage)

The flagship picture surface.
- FOLIO cards: perspective tilt on springs (max ~7°), real edge depth on
  the frame, a floor shadow that deepens/shifts as the card lifts, a glint
  sweep on hover and on first entry. Touch devices: entrance + glint only.
- Block-grid reveal: each photo resolves through a 5×4 block grid flipping
  away in a fast stagger (≤700ms) when the card first scrolls into view.
- Spring entrances with a soft overshoot, staggered.
- Detail view: the booking/info panel becomes a HAVEN frosted panel
  (translucent, light border, deep shadow — static once open); photo and
  copy at slightly different parallax depths inside the overlay.
- Flight, Enquire wiring, similar row: functionally identical.

## Pass 2 — The shared photo cards, everywhere at once

Applied at the component level so one pass lifts the homepage grids AND
the listing pages together: PackageCard, DestinationCard,
JourneyStoryCard, CruiseCard, JournalCard, ExperienceCard,
ArtListingCard, EventListingCard, CulturalAccessCard.
- FOLIO tilt/lift/floor-shadow/glint (as Pass 1, tuned per card size).
- Block-grid photo reveals on scroll entry; spring staggered entrances.
- Surfaces that inherit it: homepage Featured Journeys, Explore
  Destinations, Journey Stories, Cruise Collection, Journal sections;
  /travel-packages, /current-journeys, /destinations, /journey-stories,
  /cruises, /journal, /experiences, /exhibitions, /events,
  /cultural-access, /art-fairs, /museums listings.

## Pass 3 — Banners and page heroes (HAVEN parallax)

- Homepage FeatureBanners (Bespoke Journeys, Arts & Culture, Private
  Journeys, Holiday Collection): photo and copy at different depths —
  the photo drifts slower than the text as you scroll; staggered fly-in
  on entry (transform + opacity; no blur on the large photo).
- PageHero photographs on the landing pages (bespoke, arts-culture,
  private-journeys, holiday-collection, couples/family/group/luxury
  travel, explore, travel-by-interest, about): same parallax depth, and
  the photo resolves through a block-grid reveal on load.

## Pass 4 — Destinations on the VEKTOR curve (the one structural change)

- Homepage "Explore Destinations": the featured set (8–10 destinations)
  rides a smile curve — centre item tallest and largest, neighbours
  stepping shorter and higher with slight rotation; drag or throw it
  with eased inertia; the centre caption scramble-settles (glyphs flicker,
  then lock into the real name) in Montserrat.
- /destinations keeps its full grid (with Pass 2's treatment). "See all"
  still leads there. Nothing else about the section changes.

## Pass 5 — Detail pages: the close-up treatments

- Destination detail (/destinations/[slug]), stays, exhibition detail
  (/exhibitions/[slug]): hero photo gets HAVEN parallax; gallery photos
  (the data already carries galleries) get the Pink Rider brush-zoom —
  brush over the photo to wipe into a magnified layer of itself; on
  touch it becomes tap-and-hold zoom.
- Stays detail: a HAVEN gallery-light slider under the main photo —
  drag to relight the room (warmth/brightness), the way you'd dim a
  gallery light.
- Exhibition entries presented as FOLIO framed pieces — artworks with
  frame depth and floor shadows, focus view on click.

## Pass 6 — Gift cards on the NOWHERE ring (crown piece, optional)

- /gift-cards: the card designs stand on an ellipse ring on a critically
  damped spring — front design largest and sharpest, stepping smaller
  and softer to the back. Drag to spin, release to fling; a glint sweeps
  the front design whenever it changes; click a side design to bring it
  to the front; click the front design and its details open as a PRINTED
  RECEIPT SLIP (paper texture, torn zig-zag edge, stepped printer
  entrance) carrying the real gift-card terms/actions, read from the
  page's own data so nothing can drift. An index drawer lists all designs.

## Pass 7 — Homepage consistency sweep

- CorePaths, TravelStyles, FamilyCouplesGroup and FinalCta photographs
  get the same parallax/reveal/spring language, so no picture on the
  homepage is left plain while its neighbours move.

## Explicitly NOT in this plan

- Hero mechanics (just rebuilt and approved): untouched. Optional extra,
  only on his word: spring physics on the thumbnail rail + a glint on
  slide arrival.
- The menu: untouched. Optional extra, only on his word: a folio-framed
  preview panel inside the menu that swaps per item.
- Text-led sections (Philosophy, Standard, Concierge copy, Reviews),
  forms, My World Bridge, staff side, invoices, payments: untouched.
- No follow cursor site-wide (chrome, not pictures).

## Order and control

Passes run in the order above. Each lands separately, is captured and
reported, and can be reverted alone from its snapshot. He can stop the
programme after any pass, reorder, or strike any pass — the plan is the
menu, the go-ahead starts Pass 1.
