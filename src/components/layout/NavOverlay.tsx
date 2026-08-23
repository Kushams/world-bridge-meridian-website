"use client";

import Link from "next/link";
import { useEffect } from "react";
import { menuGroups, legalLinks } from "@/data/nav";
import { company } from "@/data/company";
import { Button } from "@/components/ui/Button";

export function NavOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 pt-8 pb-16">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg text-ivory">
              World Bridge <span className="italic text-gold">Meridian</span>
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

          <div className="mt-12 mb-10">
            <Button href="/plan-your-journey" size="lg" onClick={onClose}>
              Plan Your Journey
            </Button>
          </div>

          <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10">
            {menuGroups.map((group) => (
              <div key={group.heading}>
                <p className="eyebrow mb-4">{group.heading}</p>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="font-display text-base text-ivory-dim hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-16 pt-8 border-t hairline flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm text-stone">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="hover:text-ivory transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <a href={`mailto:${company.email}`} className="hover:text-ivory transition-colors">
              {company.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
