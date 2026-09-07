"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { travelStyles } from "@/data/travel-styles";
import { interestTags, travelerProfiles } from "@/data/interests";
import { company } from "@/data/company";
import { TravelStyleSlug } from "@/data/types";
import { buildLeadId, submitJourneyLead, type JourneyLead } from "@/lib/leads";
import { getAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

interface FormState {
  destinationMode: string;
  destinationText: string;
  originCity: string;
  dateMode: string;
  dateText: string;
  dateFlexibility: string;
  travelerType: string;
  travelerCount: string;
  styles: TravelStyleSlug[];
  interests: string[];
  travelPace: string;
  accommodationPreference: string;
  budget: string;
  organize: string[];
  specialRequirements: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  contactMethod: string;
  hearAboutUs: string;
  additionalInfo: string;
  website: string; // honeypot — must stay empty
}

const initialState: FormState = {
  destinationMode: "",
  destinationText: "",
  originCity: "",
  dateMode: "",
  dateText: "",
  dateFlexibility: "",
  travelerType: "",
  travelerCount: "",
  styles: [],
  interests: [],
  travelPace: "",
  accommodationPreference: "",
  budget: "",
  organize: [],
  specialRequirements: "",
  name: "",
  email: "",
  phone: "",
  country: "",
  contactMethod: "Email",
  hearAboutUs: "",
  additionalInfo: "",
  website: "",
};

const TOTAL_STEPS = 10;

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

const flexibilityOptions = ["Fixed — these dates only", "Some flexibility", "Fully flexible"];

const paceOptions = ["Leisurely", "Balanced", "Packed / see everything"];

const accommodationOptions = [
  "Boutique hotels",
  "Luxury resorts",
  "Villas & private homes",
  "Historic properties",
  "Ship / cruise cabin",
  "No strong preference",
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

const hearAboutOptions = [
  "Referral",
  "Search engine",
  "Social media",
  "Travel Journal / blog",
  "Press or media",
  "Other",
];

const contactMethods = ["Email", "Phone"];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function JourneyWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [deliveredVia, setDeliveredVia] = useState<"crm" | "netlify" | "mailto" | null>(null);

  useEffect(() => {
    track("journey_wizard_started");
  }, []);

  const next = () => {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    track("journey_wizard_step_completed", { step });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const attribution = getAttribution();
    const lead: JourneyLead = {
      leadId: buildLeadId(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      originCity: form.originCity,
      destination: form.destinationText,
      destinationMode: form.destinationMode,
      travelDates: form.dateText || form.dateMode,
      dateFlexibility: form.dateFlexibility,
      travelerCount: form.travelerCount,
      travelerType: form.travelerType,
      journeyTypes: form.styles.map(
        (s) => travelStyles.find((t) => t.slug === s)?.label ?? s,
      ),
      interests: form.interests,
      investmentRange: form.budget,
      travelPace: form.travelPace,
      accommodationPreference: form.accommodationPreference,
      specialRequirements: form.specialRequirements,
      organize: form.organize,
      hearAboutUs: form.hearAboutUs,
      notes: form.additionalInfo,
      source: "journey_wizard",
      campaign: attribution.utm_campaign ?? "",
      landingPage: attribution.landingPage,
      utm: {
        source: attribution.utm_source,
        medium: attribution.utm_medium,
        campaign: attribution.utm_campaign,
        content: attribution.utm_content,
        term: attribution.utm_term,
      },
      submissionDate: new Date().toISOString(),
      leadOwner: null,
      stage: "new_lead",
      nextAction: "Initial review and qualification call",
      lastContact: null,
      optOut: false,
      website: form.website,
    };

    const result = await submitJourneyLead(lead, company.email);

    if (result.ok) {
      setStatus("submitted");
      setDeliveredVia(result.via);
      track("journey_wizard_completed");
      track("consultation_requested");
      track("form_submitted", { form: "journey_wizard" });
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "submitted") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-10 text-center md:p-16">
        <p className="eyebrow mb-4">Thank You</p>
        <h2 className="font-display text-3xl md:text-4xl text-ivory">
          Your journey request has been received.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-stone">
          A member of the World Bridge Meridian team will review your requirements and respond.
          This isn&apos;t a booking or availability confirmation — we&apos;ll follow up to talk through
          what&apos;s possible.{" "}
          {deliveredVia === "mailto"
            ? "Your email app should have opened with a summary ready to send — if it didn't, please "
            : "If you don't hear from us soon, please "}
          email us directly at{" "}
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
        {/* Honeypot — hidden from real visitors via CSS, not just visually offscreen, so it stays out of the tab order too. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
          <label htmlFor="website">Leave this field blank</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

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
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Where from, and when?
            </legend>
            <label className="mb-2 mt-8 block text-xs uppercase tracking-wide text-stone">
              Departure city
            </label>
            <input
              type="text"
              value={form.originCity}
              onChange={(e) => setForm({ ...form, originCity: e.target.value })}
              placeholder="e.g. New York, NY"
              className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />

            <p className="mb-2 mt-6 text-xs uppercase tracking-wide text-stone">Travel dates</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              className="mt-4 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />

            <p className="mb-2 mt-6 text-xs uppercase tracking-wide text-stone">
              How fixed are these dates?
            </p>
            <div className="flex flex-wrap gap-3">
              {flexibilityOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, dateFlexibility: opt })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.dateFlexibility === opt
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

        {step === 3 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Who is traveling?
            </legend>
            <div className="mt-8 flex flex-wrap gap-3">
              {travelerProfiles.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, travelerType: opt })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.travelerType === opt
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <label className="mb-2 mt-6 block text-xs uppercase tracking-wide text-stone">
              Number of travelers
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.travelerCount}
              onChange={(e) => setForm({ ...form, travelerCount: e.target.value })}
              placeholder="e.g. 2 adults, 2 children"
              className="w-full max-w-xs rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 4 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Journey type
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
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              What draws you in?
            </legend>
            <p className="mt-2 text-sm text-stone-dim">
              Travel interests — select any that fit, so we know what to design around.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {interestTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setForm({ ...form, interests: toggle(form.interests, tag) })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.interests.includes(tag)
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 6 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Pace &amp; accommodation
            </legend>
            <p className="mb-2 mt-8 text-xs uppercase tracking-wide text-stone">
              Preferred travel pace
            </p>
            <div className="flex flex-wrap gap-3">
              {paceOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, travelPace: opt })}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    form.travelPace === opt
                      ? "border-gold text-gold"
                      : "border-line text-ivory-dim hover:border-gold"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="mb-2 mt-6 text-xs uppercase tracking-wide text-stone">
              Accommodation preference
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accommodationOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setForm({ ...form, accommodationPreference: opt })}
                  className={`rounded-card border px-5 py-4 text-left text-sm transition-colors ${
                    form.accommodationPreference === opt
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
              Indicative journey investment
            </legend>
            <p className="mt-2 text-sm text-stone-dim">
              A general range is enough — this helps us shape realistic options. This isn&apos;t a
              quotation, just a starting point for the conversation.
            </p>
            <input
              type="text"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="e.g. $5,000–$8,000 per person, or a total journey investment"
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 8 ? (
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
            <label className="mb-2 mt-6 block text-xs uppercase tracking-wide text-stone">
              Special requirements (optional)
            </label>
            <textarea
              rows={3}
              value={form.specialRequirements}
              onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })}
              placeholder="Accessibility needs, dietary requirements, celebrations to plan around…"
              className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
            />
          </fieldset>
        ) : null}

        {step === 9 ? (
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
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-stone">
                How did you hear about World Bridge Meridian?
              </p>
              <div className="flex flex-wrap gap-3">
                {hearAboutOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setForm({ ...form, hearAboutUs: opt })}
                    className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                      form.hearAboutUs === opt
                        ? "border-gold text-gold"
                        : "border-line text-ivory-dim hover:border-gold"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        ) : null}

        {step === 10 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-ivory">
              Additional information
            </legend>
            <p className="mt-2 text-sm text-stone-dim">
              Anything else we should know — celebrations, past trips you loved or didn&apos;t.
            </p>
            <textarea
              rows={6}
              value={form.additionalInfo}
              onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
              className="mt-6 w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
            />
            {status === "error" && error ? (
              <p role="alert" className="mt-6 rounded-card border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}
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
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Submit Journey Request"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
