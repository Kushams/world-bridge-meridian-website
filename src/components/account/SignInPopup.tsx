"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { AuthPanel } from "./AuthPanel";
import { company } from "@/data/company";

/** Pages that already show their own sign-in box (same form fields, so no popup on top). */
const GATED = ["/my-world-bridge", "/plan-your-journey", "/contact", "/travel-details-form", "/gift-cards", "/travel-credits", "/invite"];
const RETURN_KEY = "wbm_return";
const SEEN_KEY = "wbm_signin_popup_closed";

/**
 * A "sign in to continue" popup for signed-out visitors, shown shortly after a page opens.
 * Closing it lets them keep browsing (it won't return this session); the forms, gift cards,
 * credits and invites still need an account. It closes by itself once they are signed in.
 */
export function SignInPopup() {
  const { user, loading, recovering, configured } = useAuth();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(true);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => {
      setClosed(seen);
      setReady(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setClosed(true);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
      localStorage.removeItem(RETURN_KEY);
    } catch {
      /* ignore */
    }
  }

  const onAccountPage = GATED.some((g) => pathname === g || pathname === `${g}/`);
  const open = configured && ready && !loading && !user && !recovering && !closed && !onAccountPage;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    try {
      // so Google / email-link sign-in brings them back to this page
      localStorage.setItem(RETURN_KEY, JSON.stringify({ path: window.location.pathname, at: Date.now() }));
    } catch {
      /* ignore */
    }
    dialog.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-popup-title"
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-card bg-ink p-6 outline-none sm:rounded-card sm:p-8"
      >
        <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 text-2xl leading-none text-stone-dim hover:text-ivory">
          ×
        </button>
        <p className="eyebrow">{company.name}</p>
        <h2 id="signin-popup-title" className="mt-2 font-display text-2xl text-ivory">Create an account or sign in to:</h2>
        <ul className="mt-4 space-y-2 text-sm text-stone">
          {[
            "Plan journeys and send requests to your consultant",
            "Buy Travel Credits and gift cards",
            "Earn cashback and invite rewards",
            "Keep your documents and itineraries in one place",
          ].map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden className="text-gold">✓</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}
