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

/**
 * Fills the form from what the client already gave us: their profile and their exhibition travel request.
 * Anything we don't have stays a blank line to write on.
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
  signer: { name: string; title: string };
}): TravelAuthData {
  const p = opts.payload ?? {};
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string).trim() : "");
  const event = str("exhibition_or_event");
  return {
    name: str("full_name") || opts.clientName || "",
    dateOfBirth: ddmmyyyy(str("date_of_birth")),
    nationality: str("nationality"),
    passportNumber: str("passport_number"),
    passportExpiry: ddmmyyyy(str("passport_expiry")),
    phone: str("phone") || opts.clientPhone || "",
    destination: opts.destinationText.trim(),
    departingFrom: str("departure_city"),
    travelFrom: longDate(str("departure_date")),
    travelTo: longDate(str("return_date")),
    purpose: event ? `Exhibition travel: ${event}` : "",
    coveredBy: opts.coveredBy.trim(),
    entryPermit: opts.destination === "uk" ? "UK ETA" : undefined,
    emergencyName: str("emergency_name"),
    emergencyRelationship: str("emergency_relationship"),
    emergencyPhone: str("emergency_phone"),
    authorisedBy: opts.signer.name,
    authorisedTitle: opts.signer.title,
  };
}
