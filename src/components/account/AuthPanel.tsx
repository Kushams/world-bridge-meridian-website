"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";

const inputClass =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";

/**
 * Renders nothing when Supabase isn't configured — the page this sits on
 * shows its own "coming soon" copy in that case instead.
 */
export function AuthPanel() {
  const { user, loading, configured, signUp, signInWithPassword, signOut } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "confirm-email" | "error">("idle");
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

  if (status === "confirm-email") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Check Your Inbox</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">Confirm your email</h2>
        <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">
          Click the confirmation link we emailed to {email}, then come back here and sign in.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const result =
      mode === "sign-up"
        ? await signUp({ fullName, email, phone, password })
        : await signInWithPassword(email, password);

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Something went wrong — please try again.");
      return;
    }

    setStatus(mode === "sign-up" ? "confirm-email" : "idle");
  }

  return (
    <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
      <p className="eyebrow mb-3">{mode === "sign-up" ? "Create Account" : "Sign In"}</p>
      <h2 className="font-display text-2xl text-ivory md:text-3xl">
        {mode === "sign-up"
          ? "Save your journeys across every device"
          : "Welcome back"}
      </h2>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-sm space-y-4 text-left">
        {mode === "sign-up" ? (
          <>
            <div>
              <label htmlFor="auth-name" className="sr-only">
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="auth-phone" className="sr-only">
                Phone number
              </label>
              <input
                id="auth-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className={inputClass}
              />
            </div>
          </>
        ) : null}
        <div>
          <label htmlFor="auth-email" className="sr-only">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="sr-only">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "submitting"
            ? "Please wait…"
            : mode === "sign-up"
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>
      {status === "error" ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
      <button
        type="button"
        onClick={() => {
          setMode(mode === "sign-up" ? "sign-in" : "sign-up");
          setStatus("idle");
          setError("");
        }}
        className="mt-6 text-xs text-stone-dim underline transition-colors hover:text-ivory"
      >
        {mode === "sign-up" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </div>
  );
}
