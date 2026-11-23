"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/account/Avatar";
import { Logo } from "./Logo";
import { NavOverlay } from "./NavOverlay";
import { Button } from "@/components/ui/Button";
import { primaryNav } from "@/data/nav";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { avatarUrl, displayName, useAuth } from "@/lib/supabase/AuthProvider";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    // On the homepage the header stays transparent over the cinematic hero
    // until the visitor scrolls past ~30% of the viewport; everywhere else
    // it takes its solid form almost immediately, exactly as before.
    const onScroll = () =>
      setScrolled(window.scrollY > (isHome ? window.innerHeight * 0.3 : 24));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Full-screen detail overlays on the homepage (e.g. Signature Stays) ask
  // the header to stay solid while they are open.
  useEffect(() => {
    const on = () => setDetailOpen(true);
    const off = () => setDetailOpen(false);
    window.addEventListener("wbm:detail-open", on);
    window.addEventListener("wbm:detail-close", off);
    return () => {
      window.removeEventListener("wbm:detail-open", on);
      window.removeEventListener("wbm:detail-close", off);
    };
  }, []);

  const overHero = isHome && !scrolled && !menuOpen && !searchOpen && !detailOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-500 ${
          overHero
            ? "border-white/15 bg-transparent"
            : `bg-ink/95 backdrop-blur ${scrolled || menuOpen ? "hairline shadow-sm" : "border-transparent"}`
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 md:px-10 py-4">
          <div className={overHero ? "[&_span]:text-on-photo" : undefined}>
            <Logo className="min-w-0 sm:shrink-0" />
          </div>

          <nav aria-label="Primary" className="hidden min-[1440px]:flex items-center gap-7 min-[1600px]:gap-9 ml-6 mr-8">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  overHero ? "text-on-photo-dim hover:text-gold-bright" : "text-ivory-dim hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              aria-label="Search the site"
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                overHero
                  ? "border-on-photo-line text-on-photo hover:border-gold-bright hover:text-gold-bright"
                  : "border-line text-ivory hover:border-gold hover:text-gold"
              }`}
            >
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {user ? (
              <Link
                href="/my-world-bridge"
                aria-label={`My account (${displayName(user, profile)})`}
                className="rounded-full ring-1 ring-transparent transition hover:ring-gold"
              >
                <Avatar url={avatarUrl(user, profile)} name={displayName(user, profile)} />
              </Link>
            ) : (
              <Link href="/my-world-bridge" className={`hidden whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors md:block ${overHero ? "text-on-photo-dim hover:text-gold-bright" : "text-ivory-dim hover:text-gold"}`}>
                Sign in
              </Link>
            )}
            <div className="hidden md:block">
              <Button href="/plan-your-journey">Design My Journey</Button>
            </div>
            <div className={user ? "hidden" : "md:hidden"}>
              <Button href="/plan-your-journey" className="!px-4 !py-2.5 !text-xs">
                Plan
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label="Open menu"
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                overHero
                  ? "border-on-photo-line text-on-photo hover:border-gold-bright hover:text-gold-bright"
                  : "border-line text-ivory hover:border-gold hover:text-gold"
              }`}
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
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
