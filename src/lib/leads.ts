/**
 * Journey lead architecture.
 *
 * There is no CRM or database behind this site yet — it's a static export
 * with no server. This file defines the shape a real lead record should
 * take once one exists, and a submission path that already works two ways:
 *
 * 1. If NEXT_PUBLIC_LEADS_ENDPOINT is set at build time, submissions POST
 *    as JSON to that URL (a future serverless function, Formspree-style
 *    service, or CRM webhook — anything that accepts a JSON POST).
 * 2. Otherwise, it falls back to the existing mailto: behavior so the site
 *    keeps working with zero configuration.
 *
 * Swapping in a real endpoint later requires no changes to the wizard or
 * any calling code — only setting the environment variable.
 */

export type LeadStage =
  | "new_lead"
  | "qualified"
  | "consultation"
  | "journey_design"
  | "proposal"
  | "revision"
  | "accepted"
  | "payment"
  | "confirmed"
  | "traveling"
  | "completed"
  | "repeat_referral";

export interface JourneyLead {
  leadId: string;
  name: string;
  email: string;
  phone: string;
  originCity: string;
  destination: string;
  destinationMode: string;
  travelDates: string;
  dateFlexibility: string;
  travelerCount: string;
  travelerType: string;
  journeyTypes: string[];
  interests: string[];
  investmentRange: string;
  travelPace: string;
  accommodationPreference: string;
  specialRequirements: string;
  organize: string[];
  hearAboutUs: string;
  notes: string;
  source: string;
  campaign: string;
  landingPage: string;
  utm: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  };
  submissionDate: string;
  leadOwner: string | null;
  stage: LeadStage;
  nextAction: string | null;
  lastContact: string | null;
  optOut: boolean;
  /** Honeypot field — real users never fill this in. Non-empty means spam. */
  website: string;
}

function newLeadId() {
  return `wbm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildLeadId() {
  return newLeadId();
}

export function mailtoBody(lead: JourneyLead): string {
  return [
    `Destination: ${lead.destinationMode} — ${lead.destination || "n/a"}`,
    `Origin/departure city: ${lead.originCity || "n/a"}`,
    `Travel dates: ${lead.travelDates || "n/a"} (${lead.dateFlexibility || "n/a"})`,
    `Traveling as: ${lead.travelerType || "n/a"} — ${lead.travelerCount || "n/a"} traveler(s)`,
    `Journey type: ${lead.journeyTypes.join(", ") || "n/a"}`,
    `Travel interests: ${lead.interests.join(", ") || "n/a"}`,
    `Indicative journey investment: ${lead.investmentRange || "n/a"}`,
    `Preferred pace: ${lead.travelPace || "n/a"}`,
    `Accommodation preference: ${lead.accommodationPreference || "n/a"}`,
    `What to organize: ${lead.organize.join(", ") || "n/a"}`,
    `Special requirements: ${lead.specialRequirements || "n/a"}`,
    ``,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "n/a"}`,
    `How they heard about us: ${lead.hearAboutUs || "n/a"}`,
    ``,
    `Additional notes: ${lead.notes || "n/a"}`,
    ``,
    `Source: ${lead.source} · Landing page: ${lead.landingPage}`,
    `Campaign attribution: ${JSON.stringify(lead.utm)}`,
    `Lead ID: ${lead.leadId}`,
  ].join("\n");
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Submits a lead. Spam check: if the honeypot field is filled in, we report
 * success to the (bot) caller without sending anything anywhere.
 */
export async function submitJourneyLead(
  lead: JourneyLead,
  contactEmail: string,
): Promise<SubmitResult> {
  if (lead.website.trim() !== "") {
    return { ok: true };
  }

  const endpoint = process.env.NEXT_PUBLIC_LEADS_ENDPOINT;

  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) {
        return { ok: false, error: `Submission failed (${res.status}).` };
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "We couldn't reach our server. Please try again, or email us directly.",
      };
    }
  }

  // No backend configured yet — fall back to mailto so the form still works.
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Journey Request",
  )}&body=${encodeURIComponent(mailtoBody(lead))}`;
  window.location.href = mailto;
  return { ok: true };
}
