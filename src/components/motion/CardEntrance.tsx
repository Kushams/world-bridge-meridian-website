"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * Spring entrance for the shared photo cards — Pass 1's overshoot
 * entrance (translateY 44px, scale 0.965 → rest, 780ms,
 * cubic-bezier(0.34, 1.4, 0.64, 1)) as a per-card, once-only,
 * IntersectionObserver-triggered wrapper.
 *
 * It plays through a stylesheet class (globals.css: .wbm-card-in)
 * instead of WAAPI + inline opacity so SwipeRow's cloneNode loop
 * copies settle correctly: the wrapper's natural state IS its final
 * state, so a copy made before, during or after the entrance is never
 * left hidden. Reduced motion: no class is ever added — the content
 * simply appears.
 */
export function CardEntrance({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || playedRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || playedRef.current) return;
        playedRef.current = true;
        io.disconnect();
        el.classList.add("wbm-card-in");
        const clear = () => el.classList.remove("wbm-card-in");
        const onEnd = (e: AnimationEvent) => {
          if (e.target !== el) return; // child animations bubble up
          el.removeEventListener("animationend", onEnd);
          clear();
        };
        el.addEventListener("animationend", onEnd);
        // Safety net: if the end event is ever missed (background tab,
        // interrupted animation) the class still comes off — the resting
        // state is identical, so nothing jumps.
        window.setTimeout(() => {
          el.removeEventListener("animationend", onEnd);
          clear();
        }, 1400);
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
