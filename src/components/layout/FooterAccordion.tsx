"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { NavGroup } from "@/data/nav";

/**
 * Mobile/tablet accordion rendering of the footer link columns — same
 * single-open interaction as NavOverlay's AccordionGroup, so the pattern
 * is consistent across the site. Matches the header's own lg breakpoint
 * for switching off the hamburger menu; desktop (lg+) keeps the
 * always-expanded grid (see Footer.tsx), this is hidden there.
 */
export function FooterAccordion({ columns }: { columns: NavGroup[] }) {
  const [openHeading, setOpenHeading] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="lg:hidden">
      {columns.map((col) => {
        const open = openHeading === col.heading;
        return (
          <div key={col.heading} className="border-b hairline">
            <button
              type="button"
              onClick={() => setOpenHeading((c) => (c === col.heading ? null : col.heading))}
              aria-expanded={open}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="eyebrow">{col.heading}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className={`shrink-0 text-stone transition-transform duration-300 ${open ? "rotate-45" : ""}`}
              >
                <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2.5 pb-5">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-block -my-1.5 py-1.5 text-sm text-ivory-dim hover:text-gold transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
