"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchSite } from "@/lib/searchIndex";

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchSite(query), [query]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const item of results) {
      if (!map.has(item.type)) map.set(item.type, []);
      map.get(item.type)!.push(item);
    }
    return map;
  }, [results]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);
      setQuery("");
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      className={`fixed inset-0 z-[90] bg-ink transition-opacity duration-400 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 pt-28 pb-10 md:px-0">
        <div className="flex items-center gap-4 border-b hairline pb-5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-stone-dim" aria-hidden>
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, journeys, cruises, experiences, journal…"
            className="w-full bg-transparent font-display text-xl text-ivory placeholder:text-stone-dim outline-none md:text-2xl"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ivory hover:border-gold hover:text-gold transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto">
          {query.trim() === "" ? (
            <p className="text-sm text-stone-dim">
              Search across destinations, travel packages, cruises, experiences and the
              journal.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-stone-dim">
              No matches for &ldquo;{query}&rdquo; — try a destination or country name, or{" "}
              <Link href="/plan-your-journey" onClick={onClose} className="text-gold hover:text-ivory">
                tell us what you&apos;re imagining
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-10">
              {[...grouped.entries()].map(([type, items]) => (
                <div key={type}>
                  <p className="eyebrow mb-4">{type}</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="group flex items-center gap-4 rounded-control p-2 hover:bg-charcoal transition-colors"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-control">
                          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base text-ivory group-hover:text-gold transition-colors">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-stone-dim">{item.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
