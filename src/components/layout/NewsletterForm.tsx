"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No email provider is connected yet — this only acknowledges the
    // submission locally. Wire up a real provider before relying on this.
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <p className="text-sm text-ivory-dim">
        Thank you — we&apos;ll be in touch with future journal updates.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
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
        className="rounded-full bg-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:bg-white transition-colors"
      >
        Sign Up
      </button>
    </form>
  );
}
