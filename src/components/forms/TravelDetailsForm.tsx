"use client";

import { FormEvent, ReactNode, useState } from "react";
import { company } from "@/data/company";
import { track } from "@/lib/analytics";
import { submitForm } from "@/lib/formSubmissions";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";

const inputClass =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const labelClass = "mb-2 block text-xs uppercase tracking-wide text-stone";

const MAX_COMPANIONS = 8;
const MAX_ITINERARY_ROWS = 20;

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required ? <span className="text-gold"> *</span> : null}
      </label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-5 border-t hairline pt-8">
      <legend className="font-display text-2xl text-ivory pr-4">{title}</legend>
      {note ? <p className="text-sm text-stone-dim">{note}</p> : null}
      {children}
    </fieldset>
  );
}

function Choice({
  label,
  name,
  options,
  type = "radio",
}: {
  label: string;
  name: string;
  options: string[];
  type?: "radio" | "checkbox";
}) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((o) => (
          <label key={o} className="inline-flex items-center gap-2 text-sm text-ivory">
            <input type={type} name={name} value={o} className="accent-gold" />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

/** 2026-05-31 → 31/05/2026, matching the DD/MM/YYYY on the paper form. */
function ddmmyyyy(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value;
}

export function TravelDetailsForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [companions, setCompanions] = useState(0);
  const [itineraryRows, setItineraryRows] = useState(3);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    // Honeypot — real visitors never fill this in.
    if (get("company_website") !== "") {
      setStatus("sent");
      return;
    }

    const dateFields = new Set(["date_of_birth", "passport_expiry", "departure_date", "return_date"]);
    const payload: Record<string, string | null> = {};
    const add = (key: string, value: string) => {
      if (value) payload[key] = dateFields.has(key) ? ddmmyyyy(value) : value;
    };

    // Part 1 – Primary traveler
    for (const k of [
      "date_of_birth",
      "passport_number",
      "passport_expiry",
      "nationality",
      "phone",
      "uk_eta_status",
      "passport_photo_attached",
      // Part 2 – Preferences & logistics
      "departure_city",
      "departure_date",
      "return_date",
      "bed_preference",
      // Part 3 – Health & dietary
      "dietary_requirements",
      "allergies",
      // Part 4 – Emergency contact
      "emergency_name",
      "emergency_relationship",
      "emergency_phone",
    ]) {
      add(k, get(k));
    }

    // Part 5 – Accompanying travelers
    for (let i = 1; i <= companions; i++) {
      const parts = [
        ["Full name", get(`c${i}_name`)],
        ["Date of birth", ddmmyyyy(get(`c${i}_dob`))],
        ["Passport number", get(`c${i}_passport`)],
        ["Passport expiry", ddmmyyyy(get(`c${i}_expiry`))],
        ["Nationality", get(`c${i}_nationality`)],
        ["Phone", get(`c${i}_phone`)],
        ["Email", get(`c${i}_email`)],
        ["Dietary", get(`c${i}_dietary`)],
        ["Allergies", get(`c${i}_allergies`)],
      ].filter(([, v]) => v);
      if (parts.length) payload[`accompanying_traveler_${i}`] = parts.map(([k, v]) => `${k}: ${v}`).join(" | ");
    }

    // Part 6 – Itinerary
    for (let i = 1; i <= itineraryRows; i++) {
      const parts = [ddmmyyyy(get(`it${i}_date`)), get(`it${i}_location`), get(`it${i}_activity`), get(`it${i}_notes`)];
      if (parts.some(Boolean)) {
        payload[`itinerary_row_${i}`] = `Date: ${parts[0] || "-"} | Location: ${parts[1] || "-"} | Activity: ${
          parts[2] || "-"
        } | Accommodation/notes: ${parts[3] || "-"}`;
      }
    }

    const fullName = get("full_name");
    const email = get("email");
    setStatus("submitting");

    const result = await submitForm({
      formType: "travel-details",
      name: fullName,
      email,
      subject: `Travel Detail & Itinerary Form — ${fullName}`,
      message: get("special_requests") || undefined,
      payload,
      turnstileToken,
    });
    setTurnstileReset((n) => n + 1);

    if (result.ok) {
      setStatus("sent");
      track("form_submitted", { form: "travel-details" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // No mailto fallback here, unlike the contact form: this form carries
    // passport details, which shouldn't be pushed into a plain email draft.
    setNotice(
      result.kind === "unavailable"
        ? `We couldn't send your form just now. Please try again in a moment, or contact us at ${company.email}.`
        : result.error,
    );
    setStatus("error");
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center">
        <h2 className="font-display text-3xl text-ivory">Thank you — we&apos;ve received your details.</h2>
        <p className="mt-4 text-stone-dim">
          Your Travel Detail &amp; Itinerary Form has reached our team and a confirmation is on its way to
          your inbox. Your representative will be in touch to confirm the next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Leave this field blank</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Section title="Part 1: Primary Traveler Information">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Full name (exactly as it appears on passport)" name="full_name" required className="sm:col-span-2" />
          <Field label="Date of birth" name="date_of_birth" type="date" required />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Passport number" name="passport_number" required />
          <Field label="Passport expiry date" name="passport_expiry" type="date" required />
          <Field label="Nationality" name="nationality" required />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Contact phone number" name="phone" type="tel" required />
          <Field label="Email address" name="email" type="email" required />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="UK ETA status (if applicable)" name="uk_eta_status" />
          <Choice label="Passport photo page attached?" name="passport_photo_attached" options={["Yes", "No"]} />
        </div>
        <p className="text-xs text-stone-dim">
          If you haven&apos;t sent a copy of your passport photo page yet, your representative will tell you
          how to share it securely.
        </p>
      </Section>

      <Section title="Part 2: Travel Preferences & Logistics">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Preferred departure city / airport" name="departure_city" />
          <Field label="Preferred departure date" name="departure_date" type="date" />
          <Field label="Preferred return date" name="return_date" type="date" />
        </div>
        <Choice label="Bed preference" name="bed_preference" options={["Single", "Double", "Twin"]} />
      </Section>

      <Section title="Part 3: Health & Dietary Requirements">
        <Field label="Dietary requirements (e.g. vegetarian, vegan, gluten-free)" name="dietary_requirements" />
        <Field label="Allergies (please specify severity)" name="allergies" />
      </Section>

      <Section title="Part 4: Emergency Contact Information">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Emergency contact name" name="emergency_name" required />
          <Field label="Relationship to traveler" name="emergency_relationship" required />
          <Field label="Emergency contact phone number" name="emergency_phone" type="tel" required />
        </div>
      </Section>

      <Section
        title="Part 5: Accompanying Traveler Information (If Applicable)"
        note="Add one block for each accompanying traveler."
      >
        {Array.from({ length: companions }, (_, idx) => {
          const i = idx + 1;
          return (
            <div key={i} className="space-y-5 rounded-card border hairline p-5">
              <p className="eyebrow">Accompanying traveler {i}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Full name (as on passport)" name={`c${i}_name`} className="sm:col-span-2" />
                <Field label="Date of birth" name={`c${i}_dob`} type="date" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Passport number" name={`c${i}_passport`} />
                <Field label="Passport expiry date" name={`c${i}_expiry`} type="date" />
                <Field label="Nationality" name={`c${i}_nationality`} />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Contact phone number" name={`c${i}_phone`} type="tel" />
                <Field label="Email address" name={`c${i}_email`} type="email" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Dietary requirements" name={`c${i}_dietary`} />
                <Field label="Allergies" name={`c${i}_allergies`} />
              </div>
            </div>
          );
        })}
        <div className="flex gap-3">
          {companions < MAX_COMPANIONS ? (
            <button
              type="button"
              onClick={() => setCompanions((n) => n + 1)}
              className="rounded-full border border-line px-5 py-2 text-xs uppercase tracking-wide text-ivory hover:border-gold"
            >
              + Add accompanying traveler
            </button>
          ) : null}
          {companions > 0 ? (
            <button
              type="button"
              onClick={() => setCompanions((n) => n - 1)}
              className="rounded-full border border-line px-5 py-2 text-xs uppercase tracking-wide text-stone hover:border-gold"
            >
              Remove last
            </button>
          ) : null}
        </div>
      </Section>

      <Section
        title="Part 6: Proposed Travel Itinerary Overview"
        note={`To be completed by your ${company.name} representative, or left blank for you to propose.`}
      >
        <div className="space-y-4">
          {Array.from({ length: itineraryRows }, (_, idx) => {
            const i = idx + 1;
            return (
              <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr_1.5fr_1fr]">
                <div>
                  <label htmlFor={`it${i}_date`} className={labelClass}>Date</label>
                  <input id={`it${i}_date`} name={`it${i}_date`} type="date" className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`it${i}_location`} className={labelClass}>Location / city</label>
                  <input id={`it${i}_location`} name={`it${i}_location`} type="text" className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`it${i}_activity`} className={labelClass}>Planned activity / cultural programme</label>
                  <input id={`it${i}_activity`} name={`it${i}_activity`} type="text" className={inputClass} />
                </div>
                <div>
                  <label htmlFor={`it${i}_notes`} className={labelClass}>Accommodation / notes</label>
                  <input id={`it${i}_notes`} name={`it${i}_notes`} type="text" className={inputClass} />
                </div>
              </div>
            );
          })}
        </div>
        {itineraryRows < MAX_ITINERARY_ROWS ? (
          <button
            type="button"
            onClick={() => setItineraryRows((n) => n + 1)}
            className="rounded-full border border-line px-5 py-2 text-xs uppercase tracking-wide text-ivory hover:border-gold"
          >
            + Add row
          </button>
        ) : null}
      </Section>

      <Section title="Part 7: Special Requests & Additional Information">
        <div>
          <label htmlFor="special_requests" className={labelClass}>Anything else we should know</label>
          <textarea id="special_requests" name="special_requests" rows={5} className={inputClass} />
        </div>
      </Section>

      <p className="border-t hairline pt-6 text-xs text-stone-dim">
        Confidentiality notice: the information contained in this form is strictly confidential and intended
        solely for the use of {company.name} for travel planning purposes.
      </p>

      <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-ivory px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {status === "submitting" ? "Sending…" : "Submit Travel Details"}
      </button>
      {status === "error" ? <p className="text-sm text-stone-dim">{notice}</p> : null}
    </form>
  );
}
