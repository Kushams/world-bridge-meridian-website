"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Block-grid photo reveal — the shared form of Pass 1's SignatureStays
 * reveal (same 5×4 grid of bg-scrim blocks, same timing: blocks flip away
 * around their top edge, staggered diagonally, ~770ms in total), extracted
 * for the Pass 2 cards.
 *
 * The flip runs on stylesheet keyframes (globals.css: .wbm-blocks-in)
 * rather than WAAPI so the overlay survives SwipeRow's cloneNode loop
 * copies: the blocks' natural state is invisible, the animation fill
 * holds the flipped-away end state, and a copy of a mid-reveal card
 * simply replays the flip. The original unmounts once it has played.
 * Reduced motion: the overlay never appears.
 */
const BLOCK_COLS = 5;
const BLOCK_ROWS = 4;

/** Last block's delay + its flip duration — the full reveal, as Pass 1. */
export const BLOCK_REVEAL_TOTAL =
  120 + (BLOCK_COLS - 1 + BLOCK_ROWS - 1) * 38 + 380;

export function BlockReveal({ onStart }: { onStart?: () => void }) {
  const gridRef = useRef<HTMLSpanElement>(null);
  const playedRef = useRef(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || playedRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || playedRef.current) return;
        playedRef.current = true;
        io.disconnect();
        grid.classList.add("wbm-blocks-in");
        onStart?.();
        window.setTimeout(() => setGone(true), BLOCK_REVEAL_TOTAL + 60);
      },
      { threshold: 0.2 },
    );
    io.observe(grid);
    return () => io.disconnect();
  }, [onStart]);

  if (gone) return null;

  return (
    <span
      ref={gridRef}
      aria-hidden
      className="wbm-blocks pointer-events-none absolute inset-0 z-[5] grid"
      style={{
        gridTemplateColumns: `repeat(${BLOCK_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${BLOCK_ROWS}, 1fr)`,
        perspective: "420px",
      }}
    >
      {Array.from({ length: BLOCK_COLS * BLOCK_ROWS }).map((_, i) => {
        const col = i % BLOCK_COLS;
        const row = Math.floor(i / BLOCK_COLS);
        return (
          <span
            key={i}
            className="bg-scrim shadow-[inset_0_0_0_1px_rgba(250,246,236,0.06)]"
            style={{
              transformOrigin: "50% 0%",
              backfaceVisibility: "hidden",
              animationDelay: `${120 + (col + row) * 38}ms`,
            }}
          />
        );
      })}
    </span>
  );
}
