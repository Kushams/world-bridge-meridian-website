"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { NavOverlay } from "./NavOverlay";
import { Button } from "@/components/ui/Button";
import { primaryNav } from "@/data/nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          scrolled || menuOpen
            ? "bg-ink/95 backdrop-blur border-b hairline"
            : "bg-gradient-to-b from-ink/70 via-ink/20 to-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 md:px-10 py-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-8">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-ivory-dim hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Button href="/plan-your-journey">Plan Your Journey</Button>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ivory hover:border-gold hover:text-gold transition-colors"
            >
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
                <path d="M0 1H18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M0 6H18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M0 11H18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <NavOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
