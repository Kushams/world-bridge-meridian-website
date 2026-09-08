"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";

/**
 * Renders nothing when Supabase isn't configured — the page this sits on
 * shows its own "coming soon" copy in that case instead.
 */
export function AuthPanel() {
  const { user, loading, configured, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  if (!configured) return null;

  if (loading) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center text-sm text-stone md:p-12">
        Loading your account…
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Signed In</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">Welcome back, {user.email}</h2>
        <p className="mt-4 text-stone leading-relaxed">
          Your saved journeys now sync to this account across every device you sign in on.
        </p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-8 inline-flex items-center justify-center rounded-full border hairline px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:bg-ivory hover:text-ink"
        >
          Sign Out
        </button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const result = await signInWithEmail(email);
    if (result.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(result.error ?? "Something went wrong — please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Check Your Inbox</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">We sent you a sign-in link</h2>
        <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">
          Click the link we emailed to {email} to finish signing in — no password needed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
      <p className="eyebrow mb-3">Sign In</p>
      <h2 className="font-display text-2xl text-ivory md:text-3xl">
        Save your journeys across every device
      </h2>
      <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">
        Enter your email and we&apos;ll send you a sign-in link — no password to remember.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row">
        <label htmlFor="account-email" className="sr-only">
          Email address
        </label>
        <input
          id="account-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-ivory px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "sending" ? "Sending…" : "Send Link"}
        </button>
      </form>
      {status === "error" ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
