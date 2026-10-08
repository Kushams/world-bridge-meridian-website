"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

const MAX_DOTS = 8;

/**
 * A card grid that becomes a side-swipe row on phones (the next card peeks in
 * from the right, with dots underneath, Instagram-style). From md up it is
 * just the grid described by `className`. Lists longer than MAX_DOTS show a
 * "3 / 12" counter instead of a long row of dots.
 */
export function SwipeRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    setCount(items.length);
    if (items.length === 0) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (atEnd && el.scrollWidth > el.clientWidth) {
      setActive(items.length - 1);
      return;
    }
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(el.scrollLeft - (item.offsetLeft - pad));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    // Explorers filter their lists, which adds and removes cards.
    const mutation = new MutationObserver(update);
    mutation.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [update]);

  function goTo(i: number) {
    const el = ref.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: item.offsetLeft - pad, behavior: "smooth" });
  }

  return (
    <div>
      <div ref={ref} className={`swipe-row ${className}`}>
        {children}
      </div>
      {count > 1 ? (
        <div className="swipe-dots md:hidden" aria-hidden={count > MAX_DOTS ? undefined : false}>
          {count > MAX_DOTS ? (
            <span className="swipe-counter">
              {active + 1} / {count}
            </span>
          ) : (
            Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show item ${i + 1} of ${count}`}
                aria-current={i === active ? "true" : undefined}
                onClick={() => goTo(i)}
                className={`swipe-dot ${i === active ? "swipe-dot-active" : ""}`}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
