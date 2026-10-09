"use client";

import { FormEvent, useState } from "react";
import { PasswordStrength } from "./PasswordStrength";
import { useAuth } from "@/lib/supabase/AuthProvider";

const inputClass =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const primaryButton =
  "w-full rounded-full bg-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none";
const linkButton = "text-xs text-stone-dim underline transition-colors hover:text-ivory";

type Mode = "sign-in" | "sign-up" | "link" | "forgot";

/** Password input with a Show/Hide toggle so people can check what they typed. */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        minLength={8}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-16`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-stone-dim transition-colors hover:text-ivory"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

/**
 * The signed-out side of /my-world-bridge: sign in, create an account, get an
 * emailed sign-in link, reset a password (and set the new one after following
 * the reset link). The signed-in side is AccountDashboard.
 * Renders nothing when Supabase isn't configured — the page shows its own
 * "coming soon" copy in that case.
 */
export function AuthPanel() {
  const {
    loading,
    configured,
    recovering,
    googleEnabled,
    signUp,
    signInWithPassword,
    sendSignInLink,
    sendPasswordReset,
    updatePassword,
    signInWithGoogle,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [sentKind, setSentKind] = useState<"confirm" | "link" | "reset">("confirm");
  const [error, setError] = useState("");

  if (!configured) return null;

  if (loading) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center text-sm text-stone md:p-12">
        Loading your account…
      </div>
    );
  }

  // Arrived from a password-reset email: choose a new password.
  if (recovering) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Reset Password</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">Choose a new password</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
              setStatus("error");
              setError("The two passwords don't match.");
              return;
            }
            setStatus("submitting");
            const result = await updatePassword(password);
            if (!result.ok) {
              setStatus("error");
              setError(result.error ?? "Something went wrong — please try again.");
            }
          }}
          className="mx-auto mt-6 max-w-sm space-y-4 text-left"
        >
          <PasswordInput
            id="auth-new-password"
            value={password}
            onChange={setPassword}
            placeholder="New password (min. 8 characters)"
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            autoComplete="new-password"
          />
          <PasswordInput
            id="auth-new-password-confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            autoComplete="new-password"
          />
          <button type="submit" disabled={status === "submitting"} className={primaryButton}>
            {status === "submitting" ? "Please wait…" : "Save New Password"}
          </button>
          {status === "error" ? <p className="text-xs text-red-400">{error}</p> : null}
        </form>
      </div>
    );
  }

  if (status === "sent") {
    const copy = {
      confirm: {
        title: "Confirm your email",
        body: `Click the confirmation link we emailed to ${email}, then come back here and sign in.`,
      },
      link: {
        title: "Check your inbox",
        body: `We emailed a sign-in link to ${email}. Open it on this device to sign in — no password needed.`,
      },
      reset: {
        title: "Check your inbox",
        body: `If there's an account for ${email}, we've emailed a link to reset the password.`,
      },
    }[sentKind];
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Check Your Inbox</p>
        <h2 className="font-display text-2xl text-ivory md:text-3xl">{copy.title}</h2>
        <p className="mx-auto mt-4 max-w-md text-stone leading-relaxed">{copy.body}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMode("sign-in");
          }}
          className={`mt-6 ${linkButton}`}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (mode === "sign-up" && password !== confirmPassword) {
      setStatus("error");
      setError("The two passwords don't match.");
      return;
    }
    setStatus("submitting");

    let result: { ok: boolean; error?: string };
    if (mode === "sign-up") result = await signUp({ fullName, email, phone, password });
    else if (mode === "link") result = await sendSignInLink(email);
    else if (mode === "forgot") result = await sendPasswordReset(email);
    else result = await signInWithPassword(email, password);

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Something went wrong — please try again.");
      return;
    }

    if (mode === "sign-in") {
      setStatus("idle");
      return;
    }
    setSentKind(mode === "sign-up" ? "confirm" : mode === "link" ? "link" : "reset");
    setStatus("sent");
  }

  const heading = {
    "sign-in": "Welcome back",
    "sign-up": "Create your World Bridge profile",
    link: "Email me a sign-in link",
    forgot: "Reset your password",
  }[mode];
  const eyebrow = mode === "sign-up" ? "Create Account" : mode === "forgot" ? "Reset Password" : "Sign In";
  const submitLabel = {
    "sign-in": "Sign In",
    "sign-up": "Create Account",
    link: "Send Sign-In Link",
    forgot: "Send Reset Link",
  }[mode];
  const needsPassword = mode === "sign-in" || mode === "sign-up";

  function switchMode(next: Mode) {
    setConfirmPassword("");
    setMode(next);
    setStatus("idle");
    setError("");
  }

  return (
    <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-2xl text-ivory md:text-3xl">{heading}</h2>
      {mode === "sign-up" ? (
        <p className="mx-auto mt-3 max-w-sm text-sm text-stone leading-relaxed">
          Save journeys, keep your travel preferences, track your enquiries and have forms fill in
          for you.
        </p>
      ) : null}

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
        {needsPassword ? (
          <>
            <PasswordInput
              id="auth-password"
              value={password}
              onChange={setPassword}
              placeholder="Password (min. 8 characters)"
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            />
            {mode === "sign-up" ? <PasswordStrength password={password} /> : null}
            {mode === "sign-up" ? (
              <PasswordInput
                id="auth-password-confirm"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm password"
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                autoComplete="new-password"
              />
            ) : null}
          </>
        ) : null}
        <button type="submit" disabled={status === "submitting"} className={primaryButton}>
          {status === "submitting" ? "Please wait…" : submitLabel}
        </button>
      </form>
      {status === "error" ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

      {mode === "sign-in" ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <button type="button" onClick={() => switchMode("link")} className={linkButton}>
            Email me a sign-in link
          </button>
          <button type="button" onClick={() => switchMode("forgot")} className={linkButton}>
            Forgot password?
          </button>
        </div>
      ) : null}

      {googleEnabled && (mode === "sign-in" || mode === "sign-up") ? (
        <div className="mx-auto mt-5 max-w-sm">
          <p className="mb-3 text-xs uppercase tracking-wide text-stone-dim">or</p>
          <button
            type="button"
            onClick={async () => {
              const result = await signInWithGoogle();
              if (!result.ok) {
                setStatus("error");
                setError(result.error ?? "Google sign-in isn't available right now.");
              }
            }}
            className="w-full rounded-full border border-line px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:border-gold hover:text-gold"
          >
            Continue with Google
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        {mode === "sign-in" ? (
          <button type="button" onClick={() => switchMode("sign-up")} className={linkButton}>
            New here? Create an account
          </button>
        ) : (
          <button type="button" onClick={() => switchMode("sign-in")} className={linkButton}>
            {mode === "sign-up" ? "Already have an account? Sign in" : "Back to sign in"}
          </button>
        )}
      </div>
    </div>
  );
}
