"use client";

import { FormEvent, useState } from "react";
import { interestTags } from "@/data/interests";
import { travelStyles } from "@/data/travel-styles";
import { useAuth, type Profile } from "@/lib/supabase/AuthProvider";

const inputClass =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const labelClass = "mb-2 block text-xs uppercase tracking-wide text-stone";

const contactOptions = ["Email", "Phone", "WhatsApp"];
const paceOptions = ["Leisurely", "Balanced", "Packed / see everything"];
const bedOptions = ["Single", "Double", "Twin", "No preference"];

type Draft = Omit<Profile, "travel_styles" | "interests"> & {
  travel_styles: string[];
  interests: string[];
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-xs transition-colors ${
        active ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

/** How much of the profile is filled in, shown as a gentle nudge, not a gate. */
export function profileCompleteness(p: Profile | null): number {
  if (!p) return 0;
  const fields = [
    p.full_name,
    p.phone,
    p.home_city,
    p.nationality,
    p.preferred_contact,
    p.travel_pace,
    p.bed_preference,
    p.travel_styles.length ? "x" : "",
    p.interests.length ? "x" : "",
  ];
  return Math.round((fields.filter((f) => f && String(f).trim()).length / fields.length) * 100);
}

/**
 * Editable profile: contact details plus the travel preferences the journey
 * planner and exhibition form pre-fill from. Passport numbers are deliberately
 * not stored here — those are entered per trip on the exhibition form.
 */
export function ProfileForm() {
  const { profile } = useAuth();
  if (!profile) return <p className="text-sm text-stone-dim">Loading your profile…</p>;
  // Seeded once from the loaded profile; edits stay local until saved.
  return <ProfileEditor initial={profile} />;
}

function ProfileEditor({ initial }: { initial: Profile }) {
  const { updateProfile } = useAuth();
  const [draft, setDraft] = useState<Draft>(() => ({ ...initial }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus("idle");
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const clean = (v: string | null) => (v && v.trim() ? v.trim() : null);
    const result = await updateProfile({
      full_name: clean(draft.full_name),
      phone: clean(draft.phone),
      home_city: clean(draft.home_city),
      nationality: clean(draft.nationality),
      preferred_contact: draft.preferred_contact,
      travel_styles: draft.travel_styles,
      interests: draft.interests,
      travel_pace: draft.travel_pace,
      bed_preference: draft.bed_preference,
      dietary_requirements: clean(draft.dietary_requirements),
      allergies: clean(draft.allergies),
    });
    if (result.ok) {
      setStatus("saved");
    } else {
      setStatus("error");
      setError(result.error ?? "We couldn't save that — please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-name" className={labelClass}>Full name</label>
          <input id="pf-name" type="text" value={draft.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pf-phone" className={labelClass}>Phone</label>
          <input id="pf-phone" type="tel" value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="pf-city" className={labelClass}>Home city / airport</label>
          <input id="pf-city" type="text" value={draft.home_city ?? ""} onChange={(e) => set("home_city", e.target.value)} placeholder="e.g. New York (JFK)" className={inputClass} />
        </div>
        <div>
          <label htmlFor="pf-nat" className={labelClass}>Nationality</label>
          <input id="pf-nat" type="text" value={draft.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <p className={labelClass}>Preferred way to be contacted</p>
        <div className="flex flex-wrap gap-2">
          {contactOptions.map((o) => (
            <Chip key={o} active={draft.preferred_contact === o} onClick={() => set("preferred_contact", draft.preferred_contact === o ? null : o)}>
              {o}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass}>How you like to travel</p>
        <div className="flex flex-wrap gap-2">
          {travelStyles.map((s) => (
            <Chip key={s.slug} active={draft.travel_styles.includes(s.label)} onClick={() => set("travel_styles", toggle(draft.travel_styles, s.label))}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass}>What draws you</p>
        <div className="flex flex-wrap gap-2">
          {interestTags.map((t) => (
            <Chip key={t} active={draft.interests.includes(t)} onClick={() => set("interests", toggle(draft.interests, t))}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className={labelClass}>Travel pace</p>
          <div className="flex flex-wrap gap-2">
            {paceOptions.map((o) => (
              <Chip key={o} active={draft.travel_pace === o} onClick={() => set("travel_pace", draft.travel_pace === o ? null : o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className={labelClass}>Bed preference</p>
          <div className="flex flex-wrap gap-2">
            {bedOptions.map((o) => (
              <Chip key={o} active={draft.bed_preference === o} onClick={() => set("bed_preference", draft.bed_preference === o ? null : o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-diet" className={labelClass}>Dietary requirements</label>
          <input id="pf-diet" type="text" value={draft.dietary_requirements ?? ""} onChange={(e) => set("dietary_requirements", e.target.value)} placeholder="e.g. vegetarian, gluten-free" className={inputClass} />
        </div>
        <div>
          <label htmlFor="pf-allergies" className={labelClass}>Allergies (and how severe)</label>
          <input id="pf-allergies" type="text" value={draft.allergies ?? ""} onChange={(e) => set("allergies", e.target.value)} className={inputClass} />
        </div>
      </div>

      <p className="text-xs text-stone-dim leading-relaxed">
        We don&apos;t store passport numbers in your profile. You enter those for each trip on the
        Exhibition Travel Itinerary Form.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-ivory px-8 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save Profile"}
        </button>
        {status === "saved" ? <span className="text-sm text-gold" role="status">Saved ✓</span> : null}
        {status === "error" ? <span className="text-sm text-red-400" role="alert">{error}</span> : null}
      </div>
    </form>
  );
}
