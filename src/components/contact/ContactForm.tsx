"use client";

import { FormEvent, useState } from "react";
import { company } from "@/data/company";
import { track } from "@/lib/analytics";
import { submitToNetlifyForms } from "@/lib/netlifyForms";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "sent-via-email">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot — real visitors never fill this in.
    if (String(form.get("company_website") ?? "").trim() !== "") {
      setStatus("sent");
      return;
    }

    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const subject = String(form.get("subject") ?? "General Enquiry");
    const message = String(form.get("message") ?? "");

    setStatus("submitting");

    const delivered = await submitToNetlifyForms("contact", { name, email, subject, message });

    if (delivered) {
      setStatus("sent");
      track("form_submitted", { form: "contact" });
      return;
    }

    // Not served by Netlify right now (local dev, a non-Netlify preview) —
    // fall back to mailto so the message is never just lost.
    const body = `${message}\n\n— ${name} (${email})`;
    const mailto = `mailto:${company.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setStatus("sent-via-email");
    track("form_submitted", { form: "contact", via: "mailto" });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Leave this field blank</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
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
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === "submitting" ? "Sending…" : "Start a Conversation"}
      </button>
      {status === "sent" ? (
        <p className="text-sm text-stone-dim">
          Thank you — your message has been sent. We read every message and will get back to you
          at the email address you provided.
        </p>
      ) : null}
      {status === "sent-via-email" ? (
        <p className="text-sm text-stone-dim">
          Your email app should have opened with this message ready to send to {company.email}.
          If it didn&apos;t, please email us directly.
        </p>
      ) : null}
    </form>
  );
}
