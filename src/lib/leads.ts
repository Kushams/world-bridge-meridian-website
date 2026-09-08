/**
 * Journey lead architecture.
 *
 * There is no CRM behind this site yet — it's a static Next.js site hosted
 * on Netlify. This file defines the shape a real lead record should take
 * once a CRM exists, and a submission path that already works three ways,
 * tried in order:
 *
 * 1. If NEXT_PUBLIC_LEADS_ENDPOINT is set at build time, submissions POST
 *    as JSON to that URL (a future serverless function or CRM webhook).
 * 2. Otherwise, it submits through Netlify Forms — no signup, no API key,
 *    included with the site's existing Netlify hosting. Submissions show
 *    up in the Netlify dashboard and can trigger an email notification
 *    from there. See the hidden shadow form on the Plan Your Journey page
 *    for why the wizard needs one (Netlify only detects fields present in
 *    static HTML, and the wizard's real fields are never all in the DOM
 *    at once).
 * 3. If neither is reachable (local dev, a non-Netlify preview), it falls
 *    back to mailto: so the form never just fails silently.
 *
 * Swapping in a real CRM endpoint later requires no changes to the wizard
 * — only setting the environment variable.
 */

import { submitToNetlifyForms } from "./netlifyForms";

export type LeadStage =
  | "new"
  | "qualified"
  | "contacted"
  | "consultation_scheduled"
  | "proposal_in_progress"
  | "proposal_sent"
  | "negotiation"
  | "booked"
  | "traveling"
  | "completed"
  | "nurture"
  | "lost";

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

/** Netlify Forms fields must be flat strings — no nested objects or arrays. */
function flattenForNetlify(lead: JourneyLead): Record<string, string> {
  return {
    leadId: lead.leadId,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    originCity: lead.originCity,
    destination: lead.destination,
    destinationMode: lead.destinationMode,
    travelDates: lead.travelDates,
    dateFlexibility: lead.dateFlexibility,
    travelerCount: lead.travelerCount,
    travelerType: lead.travelerType,
    journeyTypes: lead.journeyTypes.join(", "),
    interests: lead.interests.join(", "),
    investmentRange: lead.investmentRange,
    travelPace: lead.travelPace,
    accommodationPreference: lead.accommodationPreference,
    specialRequirements: lead.specialRequirements,
    organize: lead.organize.join(", "),
    hearAboutUs: lead.hearAboutUs,
    notes: lead.notes,
    source: lead.source,
    campaign: lead.campaign,
    landingPage: lead.landingPage,
    utm_source: lead.utm.source ?? "",
    utm_medium: lead.utm.medium ?? "",
    utm_campaign: lead.utm.campaign ?? "",
    utm_content: lead.utm.content ?? "",
    utm_term: lead.utm.term ?? "",
    submissionDate: lead.submissionDate,
  };
}

export type DeliveryChannel = "crm" | "netlify" | "mailto";

export type SubmitResult =
  | { ok: true; via: DeliveryChannel }
  | { ok: false; error: string };

/**
 * Submits a lead. Spam check: if the honeypot field is filled in, we report
 * success to the (bot) caller without sending anything anywhere.
 */
export async function submitJourneyLead(
  lead: JourneyLead,
  contactEmail: string,
): Promise<SubmitResult> {
  if (lead.website.trim() !== "") {
    return { ok: true, via: "crm" };
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
      return { ok: true, via: "crm" };
    } catch {
      return {
        ok: false,
        error: "We couldn't reach our server. Please try again, or email us directly.",
      };
    }
  }

  const deliveredViaNetlify = await submitToNetlifyForms(
    "journey-request",
    flattenForNetlify(lead),
  );
  if (deliveredViaNetlify) {
    return { ok: true, via: "netlify" };
  }

  // Netlify Forms unreachable (local dev, a non-Netlify preview) — fall
  // back to mailto so the request is never just lost.
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
    "Journey Request",
  )}&body=${encodeURIComponent(mailtoBody(lead))}`;
  window.location.href = mailto;
  return { ok: true, via: "mailto" };
}
