"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { travelStyles } from "@/data/travel-styles";
import { company } from "@/data/company";
import { TravelStyleSlug } from "@/data/types";

interface FormState {
  destinationMode: string;
  destinationText: string;
  dateMode: string;
  dateText: string;
  travelers: string;
  styles: TravelStyleSlug[];
  budget: string;
  organize: string[];
  name: string;
  email: string;
  phone: string;
  country: string;
  contactMethod: string;
  additionalInfo: string;
}

const initialState: FormState = {
  destinationMode: "",
  destinationText: "",
  dateMode: "",
  dateText: "",
  travelers: "",
  styles: [],
  budget: "",
  organize: [],
  name: "",
  email: "",
  phone: "",
  country: "",
  contactMethod: "Email",
  additionalInfo: "",
};

const TOTAL_STEPS = 8;

const destinationOptions = [
  { value: "specific", label: "Specific destination" },
  { value: "multiple", label: "Multiple destinations" },
  { value: "unsure", label: "Not sure yet" },
];

const dateOptions = [
  { value: "exact", label: "Exact dates" },
  { value: "flexible", label: "Flexible dates" },
  { value: "month", label: "A particular month" },
  { value: "season", label: "A particular season" },
];

const travelerOptions = [
  "Solo",
  "Couple",
  "Family",
  "Friends",
  "Group",
  "Corporate",
  "Institution",
];

const organizeOptions = [
  "Accommodation",
  "Air travel coordination",
  "Cruise",
  "Transportation",
  "Activities",
  "Cultural experiences",
  "Dining",
  "Complete itinerary",
  "Everything",
];

const contactMethods = ["Email", "Phone"];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function JourneyWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const lines = [
      `Destination: ${form.destinationMode} — ${form.destinationText || "n/a"}`,
      `Travel dates: ${form.dateMode} — ${form.dateText || "n/a"}`,
      `Traveling as: ${form.travelers}`,
      `Travel style: ${form.styles.map((s) => travelStyles.find((t) => t.slug === s)?.label).join(", ") || "n/a"}`,
      `Budget: ${form.budget || "n/a"}`,
      `What to organize: ${form.organize.join(", ") || "n/a"}`,
      ``,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "n/a"}`,
      `Country: ${form.country || "n/a"}`,
      `Preferred contact method: ${form.contactMethod}`,
      ``,
      `Additional information: ${form.additionalInfo || "n/a"}`,
    ];

    const mailto = `mailto:${company.email}?subject=${encodeURIComponent(
      "Journey Request",
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-10 text-center md:p-16">
        <p className="eyebrow mb-4">Thank You</p>
        <h2 className="font-display text-3xl md:text-4xl text-ivory">
          Your journey request has been received.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone">
          A member of the World Bridge Meridian team will review your requirements and contact
          you. Your email app should have opened with a summary ready to send — if it didn&apos;t,
          please email us directly at{" "}
          <a href={`mailto:${company.email}`} className="text-gold hover:text-ivory">
            {company.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i + 1 <= step ? "bg-gold" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="eyebrow mb-8">
        Step {step} of {TOTAL_STEPS}
      </p>

      <form onSubmit={handleSubmit}>
        {step === 1 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Where do you want to go?
            </legend>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {destinationOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm({ ...form, destinationMode: opt.value })}
                  className={`rounded-card border px-5 py-4 text-left text-sm transition-colors ${
                    form.destinationMode === opt.value
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.destinationText}
              onChange={(e) => setForm({ ...form, destinationText: e.target.value })}
              placeholder="Tell us more (optional) — e.g. Italy, or a region you're drawn to"
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">When?</legend>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {dateOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm({ ...form, dateMode: opt.value })}
                  className={`rounded-card border px-5 py-4 text-left text-sm transition-colors ${
                    form.dateMode === opt.value
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.dateText}
              onChange={(e) => setForm({ ...form, dateText: e.target.value })}
              placeholder="Details (optional) — e.g. mid-June 2026, or 10 days in autumn"
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Who is traveling?
            </legend>
            <div className="mt-8 flex flex-wrap gap-3">
              {travelerOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, travelers: opt })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.travelers === opt
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Travel style
            </legend>
            <p className="mt-2 text-sm text-stone-dim">Select as many as apply.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {travelStyles.map((s) => (
                <button
                  type="button"
                  key={s.slug}
                  onClick={() => setForm({ ...form, styles: toggle(form.styles, s.slug) })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.styles.includes(s.slug)
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 5 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">Budget</legend>
            <p className="mt-2 text-sm text-stone-dim">
              A general range is enough — this helps us shape realistic options.
            </p>
            <input
              type="text"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="e.g. $5,000–$8,000 per person, or a total trip budget"
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 6 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              What should we organize?
            </legend>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {organizeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, organize: toggle(form.organize, opt) })}
                  className={`rounded-card border px-5 py-4 text-left text-sm transition-colors ${
                    form.organize.includes(opt)
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 7 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Contact details
            </legend>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wide text-stone">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-stone">
                Preferred Contact Method
              </p>
              <div className="flex gap-3">
                {contactMethods.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setForm({ ...form, contactMethod: m })}
                    className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                      form.contactMethod === m
                        ? "border-gold text-gold"
                        : "border-line text-ivory-dim hover:border-gold"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        ) : null}

        {step === 8 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Additional information
            </legend>
            <p className="mt-2 text-sm text-stone-dim">
              Anything else we should know — celebrations, accessibility needs, past trips you
              loved or didn&apos;t.
            </p>
            <textarea
              rows={6}
              value={form.additionalInfo}
              onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="text-sm font-semibold uppercase tracking-wide text-ivory-dim hover:text-gold transition-colors disabled:opacity-30 disabled:hover:text-ivory-dim"
          >
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button type="submit">Submit Journey Request</Button>
          )}
        </div>
      </form>
    </div>
  );
}
