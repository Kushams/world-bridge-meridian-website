"use client";

import { FormEvent, useState } from "react";
import { company } from "@/data/company";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const subject = String(form.get("subject") ?? "General Enquiry");
    const message = String(form.get("message") ?? "");

    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:${company.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-wide text-stone">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-wide text-stone">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-2 block text-xs uppercase tracking-wide text-stone">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="General Enquiry"
          className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-wide text-stone">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink hover:bg-white transition-colors"
      >
        Contact World Bridge Meridian
      </button>
      {sent ? (
        <p className="text-sm text-stone-dim">
          Your email app should have opened with this message ready to send to {company.email}.
          If it didn&apos;t, please email us directly.
        </p>
      ) : null}
    </form>
  );
}
