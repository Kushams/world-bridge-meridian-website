"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { NavGroup } from "@/data/nav";

/**
 * Phone/tablet footer: every link group (Explore, Journey Services, About,
 * Contact, Payments) is a tap-to-expand row, closed by default, so the footer
 * stays short. Same single-open interaction as the menu. Desktop (lg+) keeps
 * the always-expanded columns in Footer.tsx; this is hidden there.
 */
export function FooterAccordion({ columns }: { columns: NavGroup[] }) {
  const [openHeading, setOpenHeading] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="border-t hairline lg:hidden">
      {columns.map((col) => {
        const open = openHeading === col.heading;
        return (
          <div key={col.heading} className="border-b hairline">
            <button
              type="button"
              onClick={() => setOpenHeading((c) => (c === col.heading ? null : col.heading))}
              aria-expanded={open}
              className="flex min-h-12 w-full items-center justify-between py-3 text-left"
            >
              <span className="eyebrow">{col.heading}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden
                className={`shrink-0 text-gold transition-transform duration-300 ${open ? "rotate-45" : ""}`}
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
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pb-4">
                    {col.links.map((link) => {
                      const external = link.href.startsWith("mailto:") || link.href.startsWith("tel:");
                      const cls =
                        "inline-block break-words py-1.5 text-sm text-ivory-dim hover:text-gold transition-colors";
                      return (
                        <li key={link.href + link.label} className={`min-w-0 ${external ? "col-span-2" : ""}`}>
                          {external ? (
                            <a href={link.href} className={cls}>
                              {link.label}
                            </a>
                          ) : (
                            <Link href={link.href} className={cls}>
                              {link.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
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
