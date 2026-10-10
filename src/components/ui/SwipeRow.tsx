"use client";

import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from "react";

const MAX_DOTS = 8;
/** Lists longer than this also get a "Show all" button, as an alternative to swiping. */
const VIEW_ALL_MIN = 6;
/** Rows with at least this many cards drift sideways on their own, like the partner strip. */
const AUTO_MIN = 4;
const AUTO_SPEED = 32; // pixels per second
const AUTO_PAUSE_AFTER_TOUCH = 4000;

/**
 * Pull "cards per view" at each breakpoint out of the grid classes the list
 * already had (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ...), so a row on a
 * wide screen shows the same number of cards across as the old grid did.
 */
function columnVars(className: string): CSSProperties {
  const cols = (prefix: string) => {
    const m = new RegExp(`(?:^|\\s)${prefix}grid-cols-(\\d+)(?=\\s|$)`).exec(className);
    return m ? Number(m[1]) : undefined;
  };
  const sm = cols("sm:") ?? 2;
  const md = cols("md:") ?? sm;
  const lg = cols("lg:") ?? md;
  return { "--n-sm": sm, "--n-md": md, "--n-lg": lg } as CSSProperties;
}

/**
 * A card list that scrolls sideways at every screen size: one card plus a peek
 * of the next on phones, the usual 2-4 across on tablets and desktops (with
 * arrows). Dots (or a "3 / 12" counter on long lists) show there is more, and
 * long lists also offer "Show all" to lay everything out as a normal grid.
 */
export function SwipeRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const items = (Array.from(el.children) as HTMLElement[]).filter((c) => !c.hasAttribute("data-loop-clone"));
    setCount(items.length);
    const clones = el.querySelector<HTMLElement>("[data-loop-clone]");
    const loop = clones && items[0] ? clones.offsetLeft - items[0].offsetLeft : 0;
    // While the endless loop is running the row has extra copies at its end; measure the real items only.
    const over = loop > 0 ? true : el.scrollWidth > el.clientWidth + 4;
    setOverflowing(over);
    const left = loop > 0 ? el.scrollLeft % loop : el.scrollLeft;
    const start = left <= 2;
    const end = loop > 0 ? false : el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setAtStart(loop > 0 ? false : start);
    setAtEnd(end);
    if (items.length === 0) return;
    if (end && over) {
      setActive(items.length - 1);
      return;
    }
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(left - (item.offsetLeft - pad));
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
  }, [update, expanded]);

  // Long rows drift on their own, in an endless loop: the first cards come back in right after the last
  // ones, with no jump. To do that a few copies of the first cards sit after the last card, and when the
  // row has slid one full set along it quietly steps back by that distance (the view looks identical).
  // It pauses while you hover, touch or tab into it, and while off screen, and stays still for visitors
  // who prefer reduced motion. The copies are removed while it is paused, so buttons and links on the
  // cards behave normally when you use them.
  useEffect(() => {
    const el = ref.current;
    if (!el || expanded || !overflowing || count < AUTO_MIN) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = 0;
    let pos = el.scrollLeft;
    let paused = false;
    let visible = false;
    let resume: ReturnType<typeof setTimeout> | undefined;

    const originals = () => (Array.from(el.children) as HTMLElement[]).filter((c) => !c.hasAttribute("data-loop-clone"));
    const clones = () => Array.from(el.querySelectorAll<HTMLElement>("[data-loop-clone]"));
    const loopWidth = () => {
      const first = clones()[0];
      const orig = originals()[0];
      return first && orig ? first.offsetLeft - orig.offsetLeft : 0;
    };
    const removeClones = () => {
      const w = loopWidth();
      // If we are inside the copies, step back to the identical spot among the real cards first.
      if (w > 0 && el.scrollLeft >= w) el.scrollLeft -= w;
      clones().forEach((c) => c.remove());
    };
    const addClones = () => {
      const items = originals();
      if (items.length === 0) return;
      // Enough copies to fill the whole view plus one card, so the wrap-around is invisible.
      const need = el.clientWidth + (items[0].offsetWidth || 0) + 48;
      let have = clones().reduce((sum, c) => sum + c.offsetWidth + 32, 0);
      let i = clones().length;
      while (have < need && i < items.length) {
        const c = items[i].cloneNode(true) as HTMLElement;
        c.setAttribute("data-loop-clone", "");
        c.setAttribute("aria-hidden", "true");
        c.querySelectorAll<HTMLElement>("a, button, input, select, textarea").forEach((n) => n.setAttribute("tabindex", "-1"));
        el.appendChild(c);
        have += items[i].offsetWidth + 32;
        i++;
      }
    };

    const setPaused = (value: boolean) => {
      paused = value;
      if (value) {
        el.classList.remove("swipe-auto");
        removeClones();
      } else {
        addClones();
        el.classList.add("swipe-auto");
        pos = el.scrollLeft;
      }
    };
    const interact = (ms: number) => {
      clearTimeout(resume);
      if (!paused) setPaused(true);
      resume = setTimeout(() => setPaused(false), ms);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") interact(1 << 30);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") interact(500);
    };
    const onTouch = () => interact(AUTO_PAUSE_AFTER_TOUCH);

    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 64) : 0;
      last = t;
      if (!paused && visible && !document.hidden) {
        const w = loopWidth();
        if (w > 0) {
          pos += (AUTO_SPEED * dt) / 1000;
          if (pos >= w) pos -= w;
          el.scrollLeft = pos;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    const ro = new ResizeObserver(() => {
      if (!paused) addClones();
    });
    ro.observe(el);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onTouch);
    el.addEventListener("touchstart", onTouch, { passive: true });
    el.addEventListener("wheel", onTouch, { passive: true });
    el.addEventListener("focusin", onTouch);
    setPaused(false);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      io.disconnect();
      ro.disconnect();
      removeClones();
      el.classList.remove("swipe-auto");
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onTouch);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("wheel", onTouch);
      el.removeEventListener("focusin", onTouch);
    };
  }, [count, overflowing, expanded]);

  function goTo(i: number) {
    const el = ref.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    el.scrollTo({ left: item.offsetLeft - pad, behavior: "smooth" });
  }

  function page(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (expanded) {
    return (
      <div>
        <div className={className}>{children}</div>
        <div className="swipe-controls">
          <button type="button" className="swipe-viewall" onClick={() => setExpanded(false)}>
            Back to swipe view
          </button>
        </div>
      </div>
    );
  }

  const showControls = overflowing && count > 1;
  const canViewAll = count > VIEW_ALL_MIN;

  return (
    <div>
      <div ref={ref} className={`swipe-row ${className}`} style={columnVars(className)}>
        {children}
      </div>
      {showControls ? (
        <div className="swipe-controls">
          <button
            type="button"
            className="swipe-arrow"
            aria-label="Previous"
            disabled={atStart}
            onClick={() => page(-1)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {count > MAX_DOTS ? (
            <span className="swipe-counter">
              {active + 1} / {count}
            </span>
          ) : (
            <div className="swipe-dots">
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show item ${i + 1} of ${count}`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className={`swipe-dot ${i === active ? "swipe-dot-active" : ""}`}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            className="swipe-arrow"
            aria-label="Next"
            disabled={atEnd}
            onClick={() => page(1)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ) : null}
      {canViewAll ? (
        <div className="swipe-controls">
          <button type="button" className="swipe-viewall" onClick={() => setExpanded(true)}>
            Show all {count}
          </button>
        </div>
      ) : null}
    </div>
  );
}
