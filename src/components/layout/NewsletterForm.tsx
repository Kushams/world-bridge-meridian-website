"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Marketing communication (journal updates, campaigns) — distinct from the
 * Journey Wizard's service communication (responding to a specific
 * inquiry). Submitting this form is the only thing that implies marketing
 * consent; a journey request never does.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [consent, setConsent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No email provider is connected yet — this only acknowledges the
    // submission locally. Wire up a real provider (and honor unsubscribe
    // requests through it) before relying on this.
    setStatus("submitted");
    track("newsletter_signup");
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
          type="email"
          required
          placeholder="Your email"
          className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-stone-dim focus:border-gold outline-none"
        />
        <button
          type="submit"
          disabled={!consent}
          className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
        >
          Sign Up
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
    </form>
  );
}
