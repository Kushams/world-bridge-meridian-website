/**
 * Sits at the top of a full-bleed hero image, directly under the fixed
 * header. The header itself is opaque, but the raw photo edge meeting it
 * looked like a hard cut -- this fades the image in through a few bands
 * of decreasing backdrop-blur instead of a sharp line.
 */
export function HeroBlurTransition() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 md:h-40" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-1/4 backdrop-blur-lg" />
      <div className="absolute inset-x-0 top-1/4 h-1/4 backdrop-blur-md" />
      <div className="absolute inset-x-0 top-1/2 h-1/4 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-3/4 h-1/4 backdrop-blur-[2px]" />
    </div>
  );
}
