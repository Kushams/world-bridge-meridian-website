"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { menuGroups, legalLinks } from "@/data/nav";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";

function AccordionGroup({
  heading,
  links,
  open,
  onToggle,
  onLinkClick,
}: {
  heading: string;
  links: { href: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="border-b hairline">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-display text-xl md:text-2xl text-ivory">{heading}</span>
        <svg
          width="16"
          height="16"
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
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 pb-6 sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onLinkClick}
                    className="inline-block -my-1.5 py-1.5 text-base text-ivory-dim hover:text-gold transition-colors"
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
}

export function NavOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(menuGroups[0]?.heading ?? null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={`fixed inset-0 z-50 bg-ink transition-opacity duration-500 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-grid-texture absolute inset-0 opacity-40" aria-hidden />
      <div className="relative h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-[900px] px-6 md:px-10 pt-8 pb-16">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg tracking-[0.06em] uppercase text-ivory">
              World Bridge Meridian
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ivory hover:border-gold hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div className="mt-12 mb-6">
            <Button href="/plan-your-journey" size="lg" onClick={onClose}>
              Design My Journey
            </Button>
          </div>

          <nav>
            {menuGroups.map((group) => (
              <AccordionGroup
                key={group.heading}
                heading={group.heading}
                links={group.links}
                open={openGroup === group.heading}
                onToggle={() =>
                  setOpenGroup((current) => (current === group.heading ? null : group.heading))
                }
                onLinkClick={onClose}
              />
            ))}
          </nav>

          <div className="mt-10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-stone">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="inline-block -my-1.5 py-1.5 hover:text-ivory transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <a href={`mailto:${company.email}`} className="inline-block -my-1.5 py-1.5 hover:text-ivory transition-colors">
              {company.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
