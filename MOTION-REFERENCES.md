# Motion References for World Bridge Meridian

Supplied by the user 2026-11-23 (via the Dana Schutz build) so these systems can be
picked from to enhance WBM, page by page. MOTION AND MATERIAL ONLY — never the
references' palettes or content. WBM keeps its own brand: Montserrat typeface, its
own palette (gold #a6763b family, cream canvas, scrim dark) and its own content.

## The five references

1. **FOLIO ROOM** — spring physics as the site's physics: nothing moves linearly.
   Items (cards, stays, journeys) built as 3D "books"/framed pieces with real edge
   depth and a floor shadow; cursor tilt in 3D, hover lift on the spring, click
   opens a focus view with a details panel. Draggable things are thrown and
   settle on springs.

2. **VEKTOR LAB** — browsing on a curved "smile" band: centre item tallest/largest,
   neighbours stepping shorter and higher with slight rotation, eased inertia when
   thrown. Captions scramble-settle (random glyphs flicker, then lock into the real
   text) in the display face. Images resolve through a block-grid reveal (blocks
   flipping in a grid). Panels open with a clip-path wipe.

3. **Pink Rider** — brush reveal: brushing over a top image wipes it away in a torn
   trail to reveal a second image underneath; on release the surface heals back;
   on touch devices it auto-wanders. Dual marquees: a ghost outline text row + a
   solid text row. Brush-to-reveal also works as a detail/magnifier: brush a
   surface to wipe into a magnified layer of itself.

4. **HAVEN** — warm frosted-glass panels (translucent, blurred, light border, deep
   soft shadow) for cards and detail panels. Layered parallax: photo and copy at
   different depths. Cinematic intro choreography: elements un-blur and fly in,
   staggered. A sliding spring indicator for navigation state. A "gallery light"
   slider in detail views that relights the image (warmth/brightness) as you drag.

5. **NOWHERE circle lookbook** — items stand on an ellipse ring driven by a
   critically damped spring: front item largest and sharpest, stepping smaller and
   softly blurred to the back. Drag to spin, release to fling; click a side item
   to rotate it to front; click the front item to open its detail as a PRINTED
   RECEIPT SLIP (paper texture, torn zig-zag edge, stepped thermal-printer
   entrance) carrying the item's real actions. A works/index drawer lists
   everything; a follow cursor trails the pointer (dashed disc reading DRAG,
   flipping to a solid disc reading VIEW/GO over the active item); a glint sweeps
   the front item whenever it changes.

## Composition patterns that worked on Dana (adapt freely)

- Full-screen menu: clip-wipe opening, columns cascading in from opposite sides
  with un-blur, hover titles scramble-settle, a folio-framed preview panel that
  swaps per item with clip wipe + tilt, ghost marquee drifting behind, follow
  cursor, footer strip.
- Catalogue on the VEKTOR curve with FOLIO cards; focus view: clip-wipe open,
  frosted panel, gallery-light slider, brush-zoom into the image.
- Shop as the NOWHERE ring; the receipt slip reads its data from the real product
  cards so prices/links can never drift — no fake cart.
- A data globe made cinematic: fixed warm "sun" (land brightens on the lit side,
  terminator shading), atmosphere halo + rim light, a tilted orbit ring with two
  small satellites, pins pulsing as they rotate into view, fly-to on selection
  (arc + slight push-in + arrival scan ring), a scramble-settle readout of name +
  real coordinates, drifting dust motes, an occasional light sweep.
- An index/contents section rebuilt as magazine rows: numbered, big serif titles,
  a real image per row, staggered spring entrances, tilt + glint on hover.
- A film reel: items in sprocketed dark film frames with edge codes, riding a
  gentle 3D curve, slow projector drift that pauses on touch, spring throw,
  scramble caption + frame counter, centre item opens the detail view.

## Performance rules (learned the hard way on Dana)

- NO backdrop-filter blur on anything that moves (follow cursors!) or covers the
  full screen — it is the #1 lag source. Frosted panels are fine when static;
  moving elements get solid translucent surfaces.
- Follow cursors: transform-only, one requestAnimationFrame loop, lerp straight
  from clientX/clientY, ZERO layout reads (no getBoundingClientRect/scrollTop)
  per mousemove.
- No blur-filter entrance transitions on large elements; transform + opacity only.
- While a menu/overlay is open, pause the page's heavy ambient loops underneath
  (canvas renders, marquees, drifts, auto-wander); resume on close.
- Tilt handlers cache their rect on pointer-enter; inside menus, image swaps
  should not spawn heavy block reveals.

## User taste notes

- He DISLIKED endless scrolling title tickers on Dana — both marquee title rows
  were stilled into printed poster line-ups that scramble-settle once on entry
  and then rest. The ghost name marquee in the hero he kept. Do not add tickers
  to WBM without asking.
- Verify every change in captures before calling it done, as usual.

## Adaptation rule

Motion and material only. Apply where it genuinely elevates a page (hero,
destination cards, stays, journey flow), nothing forced, judged page by page
with the user.
