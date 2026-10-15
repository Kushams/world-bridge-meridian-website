import type { TravelAuthData } from "./travelAuthPdf";

/** "2026-06-15" → "15/06/2026"; anything else is passed through untouched. */
export function ddmmyyyy(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
}

/** "2026-06-15" → "15 June 2026". */
export function longDate(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return new Date(`${s}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export type Destination = "uk" | "other";

/** The title World Bridge Meridian prints under a staff member's name, same as on our emails. */
export function staffTitle(m: { email: string; role: string }): string {
  if (m.email === "earla668@gmail.com") return "Founder & Chief Executive Officer";
  return m.role === "admin" ? "Client Services" : "Travel Coordinating Officer";
}

/** Everything the traveller can see and correct on screen before signing. Dates are "yyyy-mm-dd" (date inputs). */
export interface TravelAuthValues {
  name: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  phone: string;
  departingFrom: string;
  travelFrom: string;
  travelTo: string;
  companions: string;
  entryStatus: "" | "not_applied" | "applied" | "approved";
  refusals: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyEmail: string;
}

export const EMPTY_VALUES: TravelAuthValues = {
  name: "",
  dateOfBirth: "",
  nationality: "",
  passportNumber: "",
  passportExpiry: "",
  phone: "",
  departingFrom: "",
  travelFrom: "",
  travelTo: "",
  companions: "",
  entryStatus: "",
  refusals: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyEmail: "",
};

/** What staff set when they send the form. The traveller cannot change any of this. */
export interface TravelAuthFixed {
  destination: string;
  coveredBy: string;
  purpose: string;
  /** "UK ETA" for UK trips; leave out for other destinations (no entry-status section). */
  entryPermit?: string;
  authorisedBy: string;
  authorisedTitle: string;
  authorisedSignature?: string;
}

const isIso = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * What we already know about a client: their profile, and their latest exhibition travel request.
 * Anything we don't have stays empty for the traveller to fill in.
 */
export function travelAuthPrefill(opts: {
  profile: { full_name?: string | null; phone?: string | null; nationality?: string | null } | null;
  /** payload of the client's latest exhibition travel request, if any */
  payload: Record<string, unknown> | null;
}): TravelAuthValues {
  const p = opts.payload ?? {};
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string).trim() : "");
  const date = (k: string) => (isIso(str(k)) ? str(k) : "");
  return {
    ...EMPTY_VALUES,
    name: str("full_name") || opts.profile?.full_name?.trim() || "",
    dateOfBirth: date("date_of_birth"),
    nationality: str("nationality") || opts.profile?.nationality?.trim() || "",
    passportNumber: str("passport_number"),
    passportExpiry: date("passport_expiry"),
    phone: str("phone") || opts.profile?.phone?.trim() || "",
    departingFrom: str("departure_city"),
    travelFrom: date("departure_date"),
    travelTo: date("return_date"),
    emergencyName: str("emergency_name"),
    emergencyRelationship: str("emergency_relationship"),
    emergencyPhone: str("emergency_phone"),
  };
}

/** Required before the traveller can sign: who they are, how to identify them, and who to call in an emergency. */
export function missingValues(v: TravelAuthValues): string[] {
  const need: [keyof TravelAuthValues, string][] = [
    ["name", "full name"],
    ["dateOfBirth", "date of birth"],
    ["nationality", "nationality"],
    ["passportNumber", "passport number"],
    ["passportExpiry", "passport expiry date"],
    ["phone", "contact phone"],
    ["emergencyName", "emergency contact name"],
    ["emergencyPhone", "emergency contact phone"],
  ];
  return need.filter(([k]) => !v[k].trim()).map(([, label]) => label);
}

/** What changes on the client's profile when they correct details on the form. Only what the profile holds, and never an empty value. */
export function profilePatch(v: TravelAuthValues): { full_name?: string; phone?: string; nationality?: string } {
  const out: { full_name?: string; phone?: string; nationality?: string } = {};
  if (v.name.trim()) out.full_name = v.name.trim();
  if (v.phone.trim()) out.phone = v.phone.trim();
  if (v.nationality.trim()) out.nationality = v.nationality.trim();
  return out;
}

/** The form's wording and layout data, from the traveller's values plus what staff fixed. */
export function travelAuthPdfData(
  v: TravelAuthValues,
  fixed: TravelAuthFixed,
  signed?: { typedName?: string; drawn?: string; on?: string; note?: string },
): TravelAuthData {
  return {
    name: v.name.trim(),
    dateOfBirth: ddmmyyyy(v.dateOfBirth),
    nationality: v.nationality.trim(),
    passportNumber: v.passportNumber.trim(),
    passportExpiry: ddmmyyyy(v.passportExpiry),
    phone: v.phone.trim(),
    destination: fixed.destination.trim(),
    departingFrom: v.departingFrom.trim(),
    travelFrom: longDate(v.travelFrom),
    travelTo: longDate(v.travelTo),
    companions: v.companions.trim(),
    purpose: fixed.purpose,
    coveredBy: fixed.coveredBy.trim(),
    entryPermit: fixed.entryPermit,
    entryStatus: v.entryStatus || undefined,
    refusals: v.refusals.trim(),
    emergencyName: v.emergencyName.trim(),
    emergencyRelationship: v.emergencyRelationship.trim(),
    emergencyPhone: v.emergencyPhone.trim(),
    emergencyEmail: v.emergencyEmail.trim(),
    authorisedBy: fixed.authorisedBy,
    authorisedTitle: fixed.authorisedTitle,
    authorisedSignature: fixed.authorisedSignature,
    travellerTypedName: signed?.typedName,
    travellerSignature: signed?.drawn,
    signedOn: signed?.on,
    signedNote: signed?.note,
  };
}

/** City and country of a venue as the destination line, and whether it is a UK trip (which adds the UK ETA section). */
export function destinationFor(place: { city: string; country: string }): { text: string; kind: Destination } {
  const country = place.country.trim();
  const kind: Destination = /^(united kingdom|uk|england|scotland|wales|northern ireland)$/i.test(country) ? "uk" : "other";
  const text = place.city.trim() && place.city.trim() !== country ? `${place.city.trim()}, ${country}` : country;
  return { text, kind };
}

/**
 * Staff's "print, sign and send back" version and previews: the form filled in from the client's profile and exhibition
 * travel request, with the World Bridge Meridian signer's name.
 */
export function travelAuthFromRequest(opts: {
  clientName: string | null;
  clientPhone: string | null;
  /** payload of the client's latest exhibition travel request, if any */
  payload: Record<string, unknown> | null;
  destination: Destination;
  /** destination text; for "uk" this defaults to London, United Kingdom */
  destinationText: string;
  coveredBy: string;
  signer: { name: string; title: string; signature?: string };
  /** Overrides the "Exhibition travel: …" purpose line. */
  purpose?: string;
}): TravelAuthData {
  const values = travelAuthPrefill({ profile: { full_name: opts.clientName, phone: opts.clientPhone }, payload: opts.payload });
  const event = typeof opts.payload?.exhibition_or_event === "string" ? (opts.payload.exhibition_or_event as string).trim() : "";
  return travelAuthPdfData(values, {
    destination: opts.destinationText,
    coveredBy: opts.coveredBy,
    purpose: opts.purpose ?? (event ? `Exhibition travel: ${event}` : ""),
    entryPermit: opts.destination === "uk" ? "UK ETA" : undefined,
    authorisedBy: opts.signer.name,
    authorisedTitle: opts.signer.title,
    authorisedSignature: opts.signer.signature,
  });
}

/** Finds the site's listing a client named in their travel request ("Title — Venue, City", or just the title). */
export function matchListing<T extends { title: string; venue: string; city: string }>(event: string, listings: T[]): T | undefined {
  const e = event.trim().toLowerCase();
  if (!e) return undefined;
  return (
    listings.find((l) => `${l.title} — ${l.venue}, ${l.city}`.toLowerCase() === e) ??
    listings.find((l) => e.includes(l.title.toLowerCase()) && e.includes(l.venue.toLowerCase().split(",")[0])) ??
    listings.find((l) => e.includes(l.title.toLowerCase()))
  );
}

/** The gallery/venue name without its city, e.g. "Pace Gallery, London" → "Pace Gallery". */
export const venueName = (venue: string) => venue.split(",")[0].trim();
