"use client";

import { Avatar } from "@/components/account/Avatar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { menuGroups, legalLinks } from "@/data/nav";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";
import { avatarUrl, displayName, useAuth } from "@/lib/supabase/AuthProvider";

/** Quick-access tiles at the top of the menu; every one also lives in a group below. */
const popularLinks = [
  { href: "/destinations", label: "Destinations" },
  { href: "/travel-packages", label: "Travel Packages" },
  { href: "/exhibitions", label: "Gallery Exhibitions" },
  { href: "/contact", label: "Contact Us" },
];

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
        className="flex min-h-14 w-full items-center justify-between gap-3 py-3.5 text-left"
      >
        <span className="font-display text-xl md:text-2xl text-ivory">{heading}</span>
        <span className="ml-auto text-xs tabular-nums text-stone-dim">{links.length}</span>
        <svg
          width="16"
          height="16"
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
            <ul className="grid grid-cols-2 gap-2 pb-5 pt-1 sm:grid-cols-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onLinkClick}
                    className="flex min-h-12 items-center rounded-control border border-line px-3.5 py-2 text-[15px] leading-snug text-ivory-dim transition-colors hover:border-gold hover:text-gold"
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
  const { user, profile } = useAuth();
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
        <div className="mx-auto w-full max-w-[900px] px-6 md:px-10 pb-32">
          <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between bg-ink/95 px-6 py-4 backdrop-blur md:-mx-10 md:px-10">
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

          <div className="mt-4">
            <Button href="/plan-your-journey" size="lg" onClick={onClose} className="w-full">
              Design My Journey
            </Button>
          </div>

          {user ? (
            <Link
              href="/my-world-bridge"
              onClick={onClose}
              className="mt-4 flex items-center gap-3 rounded-card border border-line px-4 py-3 transition-colors hover:border-gold"
            >
              <Avatar url={avatarUrl(user, profile)} name={displayName(user, profile)} className="h-9 w-9 text-sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm text-ivory">{displayName(user, profile)}</span>
                <span className="block text-xs text-stone-dim">View my profile & wallet</span>
              </span>
            </Link>
          ) : null}

          <p className="eyebrow mb-3 mt-8">Popular</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {popularLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex min-h-14 items-center justify-center rounded-card border border-line bg-charcoal px-3 py-2 text-center font-display text-base leading-tight text-ivory transition-colors hover:border-gold hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="eyebrow mb-1 mt-8">Explore the site</p>

          <nav className="border-t hairline">
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

          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <a
              href={`mailto:${company.email}`}
              className="flex min-h-12 items-center justify-center rounded-control border border-line px-4 py-2 text-sm text-ivory hover:border-gold hover:text-gold"
            >
              {company.email}
            </a>
            {company.phone ? (
              <a
                href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}
                className="flex min-h-12 items-center justify-center rounded-control border border-line px-4 py-2 text-sm text-ivory hover:border-gold hover:text-gold"
              >
                {company.phone}
              </a>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t hairline pt-6 text-sm text-stone">
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
          </div>
        </div>
      </div>
    </div>
  );
}
