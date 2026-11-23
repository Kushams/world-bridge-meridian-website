"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { FolioTilt } from "@/components/motion/FolioTilt";
import { BlockReveal, BLOCK_REVEAL_TOTAL } from "@/components/motion/BlockReveal";

/**
 * The Pass 2 photo treatment in one piece, mirroring Pass 1's StayCard:
 * a FOLIO spring tilt with frame edge depth and a floor shadow, the
 * block-grid reveal resolving over the photo, and the diagonal glint
 * that sweeps once as the reveal lands and again on hover.
 *
 * Children are the photo plus any scrims, badges or captions that belong
 * over it — give those overlays z-[6] so they rest above the flipping
 * blocks (z-[5]) and below the glint (z-[7]), exactly as in Pass 1.
 * Set maxTilt to 0 for wide-and-short photo strips (listing headers):
 * the piece then lifts and glints without rotating.
 */
export function FolioCardPhoto({
  children,
  className = "",
  tiltClassName = "w-full",
  maxTilt = 7,
  depth = 10,
}: {
  children: ReactNode;
  /** Classes for the photo frame itself (aspect/height, rounding, background). */
  className?: string;
  /** Classes for the tilt wrapper (width / flex-shrink behaviour). */
  tiltClassName?: string;
  /** Peak tilt in degrees; 0 = lift + glint only. */
  maxTilt?: number;
  /** Frame edge thickness in px. */
  depth?: number;
}) {
  const glintRef = useRef<HTMLSpanElement>(null);
  const lastGlintRef = useRef(0);
  const glintTimerRef = useRef(0);

  const runGlint = useCallback(() => {
    const g = glintRef.current;
    if (!g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    if (now - lastGlintRef.current < 1200) return;
    lastGlintRef.current = now;
    g.animate(
      [
        { transform: "translateX(-180%) skewX(-18deg)", opacity: 0 },
        { opacity: 1, offset: 0.16 },
        { transform: "translateX(280%) skewX(-18deg)", opacity: 0 },
      ],
      { duration: 950, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
  }, []);

  // The entry glint lands just as the block reveal finishes (Pass 1
  // fired it at total − 200ms).
  const handleRevealStart = useCallback(() => {
    glintTimerRef.current = window.setTimeout(
      runGlint,
      Math.max(0, BLOCK_REVEAL_TOTAL - 200),
    );
  }, [runGlint]);

  useEffect(
    () => () => {
      window.clearTimeout(glintTimerRef.current);
    },
    [],
  );

  return (
    <FolioTilt
      className={tiltClassName}
      maxTilt={maxTilt}
      depth={depth}
      onHoverChange={(hovering) => {
        if (hovering) runGlint();
      }}
    >
      <div className={`relative ${className}`}>
        {children}
        <BlockReveal onStart={handleRevealStart} />
        {/* Glint — a diagonal light sweep, fired on entry and on hover */}
        <span
          ref={glintRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[7] w-[45%] opacity-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,244,214,0) 0%, rgba(255,244,214,0.38) 50%, rgba(255,244,214,0) 100%)",
            transform: "translateX(-180%) skewX(-18deg)",
          }}
        />
      </div>
    </FolioTilt>
  );
}
