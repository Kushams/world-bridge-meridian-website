"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";
import { submitForm } from "@/lib/formSubmissions";
import { submitToNetlifyForms } from "@/lib/netlifyForms";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

/**
 * Marketing communication (journal updates, campaigns) — distinct from the
 * Journey Wizard's service communication (responding to a specific
 * inquiry). Submitting this form is the only thing that implies marketing
 * consent; a journey request never does.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "throttled">(
    "idle",
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");

    setStatus("submitting");
    // Supabase is the backend; Netlify Forms stays as a fallback while
    // Netlify serves the site. If neither is reachable we still show
    // success rather than lose the signup visibly — there is no mailto
    // fallback that makes sense for a newsletter signup the way it does
    // for a direct message.
    const result = await submitForm({ formType: "newsletter", email, turnstileToken });
    setTurnstileReset((n) => n + 1);
    if (!result.ok) {
      if (result.kind === "verification") {
        setNotice(result.error);
        setStatus("idle");
        return;
      }
      if (result.kind === "throttled") {
        setNotice(result.error);
        setStatus("throttled");
        return;
      }
      await submitToNetlifyForms("newsletter", { email });
    }
    setStatus("submitted");
    track("newsletter_signup");
  }

  if (status === "throttled") {
    return <p className="text-sm text-ivory-dim">{notice}</p>;
  }

  if (status === "submitted") {
    return (
      <p className="text-sm text-ivory-dim">
        Thank you — we&apos;ll be in touch with future journal updates. You can unsubscribe at any
        time from the link in any email we send.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-gold outline-none"
        />
        <button
          type="submit"
          disabled={!consent || status === "submitting"}
          className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
        >
          {status === "submitting" ? "Signing Up…" : "Sign Up"}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-dim">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-gold"
        />
        <span>
          I&apos;d like to receive occasional journal updates and travel inspiration from World
          Bridge Meridian by email. Unsubscribe anytime.
        </span>
      </label>
      {consent ? (
        <div className="mt-3">
          <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
        </div>
      ) : null}
      {status === "idle" && notice ? <p className="mt-2 text-xs text-stone-dim">{notice}</p> : null}
    </form>
  );
}
