"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { AuthPanel } from "./AuthPanel";

const RETURN_KEY = "wbm_return";

/**
 * Wrap anything that needs a signed-in customer (buying gift cards or credits,
 * the Invite Program). Signed out → sign up / sign in right here (email,
 * password, magic link or Google); signed in → the content. We remember the
 * page so email-confirmation and Google sign-in bring the customer back to it.
 */
export function AccountGate({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  const { user, loading, recovering, configured } = useAuth();
  const signedIn = Boolean(user) && !recovering;

  useEffect(() => {
    try {
      if (signedIn) localStorage.removeItem(RETURN_KEY);
      else localStorage.setItem(RETURN_KEY, JSON.stringify({ path: window.location.pathname + window.location.hash, at: Date.now() }));
    } catch {
      /* private mode: the gate still works, we just can't return the customer */
    }
  }, [signedIn]);

  if (!configured) return <>{children}</>;
  if (loading) return <p className="text-sm text-stone-dim">Loading…</p>;
  if (signedIn) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 rounded-card border border-gold/50 bg-gold/5 p-5">
        <p className="eyebrow mb-1">Account needed</p>
        <h3 className="font-display text-xl text-ivory">{title}</h3>
        <p className="mt-2 text-sm text-stone leading-relaxed">{intro}</p>
      </div>
      <AuthPanel />
    </div>
  );
}

/** After signing in elsewhere (Google, email link) return to where the customer started. */
export function consumeReturnPath(): string | null {
  try {
    const raw = localStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    localStorage.removeItem(RETURN_KEY);
    const { path, at } = JSON.parse(raw) as { path: string; at: number };
    if (!path || Date.now() - at > 60 * 60 * 1000) return null;
    return path;
  } catch {
    return null;
  }
}
