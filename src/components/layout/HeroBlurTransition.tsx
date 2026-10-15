/**
 * Sits at the top of a full-bleed hero image, directly under the fixed header, so the photo eases in under
 * the header instead of meeting it with a hard cut. A single soft shade (see .scrim-hero-top): no blur, so
 * there are no visible bands, and the photo underneath stays sharp.
 */
export function HeroBlurTransition() {
  return <div className="scrim-hero-top pointer-events-none absolute inset-x-0 top-0 z-10 h-24 md:h-32" aria-hidden />;
}
