"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let nextRippleId = 0;

/**
 * A soft gold ring at every touch point — on buttons, cards or just the
 * bare page (including where a scroll gesture starts), so touch feels
 * acknowledged the way a mouse cursor already is via CustomCursor.
 * Coarse-pointer only; a no-op everywhere a fine pointer is present.
 */
export function TouchRipple() {
  const prefersReducedMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const remove = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (!isCoarsePointer) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setRipples((prev) => [...prev, { id: nextRippleId++, x: touch.clientX, y: touch.clientY }]);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => window.removeEventListener("touchstart", onTouchStart);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0.55, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => remove(r.id)}
            className="absolute rounded-full border border-gold/70 bg-gold/15"
            style={{
              left: r.x,
              top: r.y,
              width: 56,
              height: 56,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
