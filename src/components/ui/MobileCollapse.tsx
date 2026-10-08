"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * Long content that is collapsed behind a "Show details" bar on phones and
 * always open from md up. Rendered open on the server (so it works without
 * JS and the desktop layout never shifts), then folded on phones after
 * mount. A link to an anchor inside it (e.g. /payments#buy-crypto) opens it.
 */
export function MobileCollapse({
  label = "Show details",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const openForHash = () => {
      const id = window.location.hash.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (target && el.contains(target)) {
        el.open = true;
        target.scrollIntoView();
      }
    };
    el.open = !isPhone;
    openForHash();
    window.addEventListener("hashchange", openForHash);
    return () => window.removeEventListener("hashchange", openForHash);
  }, []);

  return (
    <details ref={ref} open className="group md:contents">
      <summary className="mt-6 flex cursor-pointer list-none items-center justify-between rounded-card border hairline px-5 py-3.5 text-sm font-semibold uppercase tracking-wide text-ivory md:hidden">
        <span className="group-open:hidden">{label}</span>
        <span className="hidden group-open:inline">Hide details</span>
        <span aria-hidden className="text-gold transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="group-open:pt-6 md:pt-0">{children}</div>
    </details>
  );
}
