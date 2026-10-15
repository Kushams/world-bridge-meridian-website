import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { FONT, layout, requestTopic, type Signature, staffSignature } from "../_shared/email.ts";
import { hidePassport, mask } from "../_shared/privacy.ts";
import { pushToTeam } from "../_shared/push.ts";

// Set as function secrets, never in source. Shared with the database
// trigger in supabase/forms.sql, which sends the secret as
// x-wbm-notify-secret — the anon key alone proves nothing, it ships in
// the site's JS bundle.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAFF_URL = "https://worldbridgemeridian.com/staff";
const ACCOUNT_URL = "https://worldbridgemeridian.com/my-world-bridge";

type FormType = "contact" | "newsletter" | "journey-request" | "travel-details" | "gift-card" | "travel-credits";

interface FormRecord {
  id: string;
  form_type: FormType;
  name: string | null;
  email: string;
  subject: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  submitted_at: string;
}

const LABELS: Record<FormType, string> = {
  contact: "Contact enquiry",
  newsletter: "Newsletter signup",
  "journey-request": "Journey request",
  "travel-details": "Exhibition travel request",
  "gift-card": "Gift card order — check the crypto payment, then set status to confirmed",
  "travel-credits": "Travel Credits purchase — check the crypto payment, then set status to confirmed",
};

type Section = { title: string; keys: string[]; client?: boolean };

const SECTIONS: Partial<Record<FormType, Section[]>> = {
  "journey-request": [
    { title: "The journey", client: true, keys: ["requestType", "requestedItem", "destination", "destinationMode", "originCity", "travelDates", "dateFlexibility"] },
    { title: "Who is travelling", client: true, keys: ["travelerType", "travelerCount"] },
    { title: "Style and preferences", client: true, keys: ["journeyTypes", "interests", "travelPace", "accommodationPreference", "investmentRange", "organize"] },
    { title: "Personal requirements", keys: ["specialRequirements", "bedPreference", "dietaryRequirements", "allergies"] },
    { title: "Contact", keys: ["phone", "country", "contactMethod", "hearAboutUs"] },
    { title: "Travel Credits", keys: ["use_travel_credits", "travel_credits_balance_usd"] },
  ],
  "travel-details": [
    { title: "The exhibition", client: true, keys: ["exhibition_or_event", "event_type", "event_dates", "please_arrange"] },
    { title: "Travel", client: true, keys: ["departure_city", "departure_date", "return_date", "bed_preference"] },
    { title: "Primary traveller", keys: ["date_of_birth", "nationality", "phone", "passport_number", "passport_expiry", "uk_eta_status", "passport_photo_attached"] },
    { title: "Health and dietary", keys: ["dietary_requirements", "allergies"] },
    { title: "Emergency contact", keys: ["emergency_name", "emergency_relationship", "emergency_phone"] },
  ],
};

/** Attribution and housekeeping fields the team never needs to read. */
const HIDDEN = new Set(["leadId", "name", "email", "notes", "source", "campaign", "landingPage", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "submissionDate", "payment_method"]);

const FIELD_LABELS: Record<string, string> = {
  requestType: "Enquiring about",
  requestedItem: "Name",
  destinationMode: "Destination type",
  originCity: "Travelling from",
  travelerType: "Travelling as",
  travelerCount: "Travellers",
  journeyTypes: "Journey type",
  investmentRange: "Journey investment",
  organize: "To organise",
  hearAboutUs: "Heard about us",
  exhibition_or_event: "Exhibition / event",
  event_type: "Type",
  event_dates: "Dates",
  please_arrange: "Please arrange",
  uk_eta_status: "UK ETA status",
};

/** Submissions are attacker-controlled text going into an HTML email. */
function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function humanize(key: string): string {
  return key
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function display(v: unknown): string {
  return Array.isArray(v) ? v.join(", ") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
}

function filled(v: unknown): boolean {
  return v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);
}

const H3 = `style="margin:24px 0 8px;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f"`;
const TD_K = `width="38%" style="width:38%;padding:6px 16px 6px 0;vertical-align:top;color:#77716a;font-size:13px"`;
const TD_V = `style="padding:6px 0;vertical-align:top;font-size:14px;color:#1c1c1c"`;

function rows(pairs: [string, unknown][]): string {
  return pairs
    .filter(([, v]) => filled(v))
    .map(([k, v]) => `<tr><td ${TD_K}>${esc(FIELD_LABELS[k] ?? humanize(k))}</td><td ${TD_V}>${esc(k === "passport_number" ? mask(v) : display(v))}</td></tr>`)
    .join("");
}

function block(title: string, body: string): string {
  return body ? `<h3 ${H3}>${esc(title)}</h3><table role="presentation" style="border-collapse:collapse;width:100%">${body}</table>` : "";
}

/** "Date: 03/05/2027 | Location: London | …" rows from the exhibition form, as one table. */
function itineraryTable(payload: Record<string, unknown>): string {
  const lines = Object.keys(payload)
    .filter((k) => /^itinerary_row_\d+$/.test(k))
    .sort((a, b) => Number(a.split("_").pop()) - Number(b.split("_").pop()))
    .map((k) => String(payload[k]).split(" | ").map((part) => part.replace(/^[^:]+:\s*/, "")));
  if (!lines.length) return "";
  const th = `style="padding:6px 10px 6px 0;text-align:left;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#77716a;border-bottom:1px solid #e8e1d3"`;
  const td = `style="padding:8px 10px 8px 0;vertical-align:top;font-size:13px;color:#1c1c1c;border-bottom:1px solid #f1ece2"`;
  return `<h3 ${H3}>Itinerary</h3><table role="presentation" style="border-collapse:collapse;width:100%">
<tr><th ${th}>Date</th><th ${th}>Location</th><th ${th}>Activity</th><th ${th}>Stay / notes</th></tr>
${lines.map((c) => `<tr>${[0, 1, 2, 3].map((i) => `<td ${td}>${esc(c[i] && c[i] !== "-" ? c[i] : "")}</td>`).join("")}</tr>`).join("")}
</table>`;
}

function travellers(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).filter((k) => /^accompanying_traveler_\d+$/.test(k)).sort();
  return block("Accompanying travellers", keys.map((k, i) => `<tr><td ${TD_K}>Traveller ${i + 2}</td><td ${TD_V}>${esc(hidePassport(payload[k]))}</td></tr>`).join(""));
}

/** One display row; the selected package/cruise is labelled by its type, and echoes of it are dropped. */
function pair(p: Record<string, unknown>, k: string): [string, unknown][] {
  if (k === "requestType") return [];
  if (k === "requestedItem") return p.requestedItem ? [[String(p.requestType || "Selected"), p.requestedItem]] : [];
  if (k === "destination" && p.destination === p.requestedItem) return [];
  if (k === "destinationMode" && (p.destinationMode === "specific" || p.destination)) return [];
  return [[k, p[k]]];
}

/** Everything the client sent, grouped the way their form was. `clientCopy` keeps passports and contacts out. */
function details(record: FormRecord, clientCopy: boolean): string {
  const payload = record.payload ?? {};
  const sections = SECTIONS[record.form_type];
  if (!sections) {
    return clientCopy ? "" : block("Details", rows(Object.entries(payload).filter(([k]) => !HIDDEN.has(k))));
  }
  const used = new Set<string>();
  let html = "";
  if (!clientCopy && record.form_type === "travel-details") {
    html += `<p style="margin:0 0 8px;font-size:13px;color:#77716a">Passport numbers are partly hidden in email. Open the client's page on the staff site (you will be asked to sign in) for the full details.</p>`;
  }
  for (const s of sections) {
    s.keys.forEach((k) => used.add(k));
    if (clientCopy && !s.client) continue;
    html += block(s.title, rows(s.keys.flatMap((k) => pair(payload, k))));
  }
  if (record.form_type === "travel-details") {
    html += itineraryTable(payload);
    if (!clientCopy) html += travellers(payload);
  }
  if (!clientCopy) {
    const rest = Object.entries(payload).filter(
      ([k]) => !used.has(k) && !HIDDEN.has(k) && !/^(itinerary_row|accompanying_traveler)_\d+$/.test(k),
    );
    html += block("Other details", rows(rest));
  }
  return html;
}

const topic = (record: FormRecord) => requestTopic(record);

/** Client-facing wording per form. */
function copy(record: FormRecord) {
  const p = record.payload ?? {};
  const t = topic(record);
  switch (record.form_type) {
    case "travel-details":
      return {
        subject: `Your exhibition travel request${t ? `: ${t}` : ""}`,
        heading: "Your exhibition travel request",
        intro: t
          ? `Thank you for planning your visit to <strong>${esc(t)}</strong> with us. Your travel details and itinerary have reached our team.`
          : "Thank you for planning your exhibition visit with us. Your travel details and itinerary have reached our team.",
        steps: [
          "We confirm the exhibition dates, timed entry and any preview or private viewing access.",
          "We arrange your flights, transfers and hotel around your itinerary.",
          "Your itinerary and quote arrive in your account, ready to review and confirm.",
        ],
      };
    case "journey-request": {
      const kind = String(p.requestType ?? "");
      const label = kind === "Cruise" ? "cruise" : kind === "Travel package" ? "journey" : kind === "Stay" ? "stay" : kind === "Private journey" ? "private journey" : "journey";
      return {
        subject: `Your ${label} request${t ? `: ${t}` : ""}`,
        heading: kind === "Cruise" ? "Your cruise request" : kind === "Private journey" ? "Your private journey request" : "Your journey request",
        intro: t
          ? `Thank you for your interest in <strong>${esc(t)}</strong>. Your answers have reached our team, and we're already looking at how to shape it around you.`
          : "Thank you for designing your journey with us. Your answers have reached our team, and we're already looking at how to shape it around you.",
        steps: kind === "Cruise"
          ? [
              "We check sailing dates, suite categories and availability for your party.",
              "We add flights, pre- and post-cruise stays and private shore experiences.",
              "Your proposal arrives in your account, ready to review and refine.",
            ]
          : [
              "Your travel coordinator reviews your answers and may message you with a question or two.",
              "We prepare a tailored proposal: hotels, experiences and a day-by-day plan.",
              "Your proposal arrives in your account, ready to review and refine.",
            ],
      };
    }
    case "gift-card":
      return { subject: "We've received your gift card order", heading: "Your gift card order", intro: "Thank you. We will verify your payment on the blockchain, then email the gift card code(s).", steps: [] };
    case "travel-credits":
      return { subject: "We've received your Travel Credits purchase", heading: "Your Travel Credits purchase", intro: "Thank you. We will verify your payment on the blockchain, then add the credits to your account and email you.", steps: [] };
    default:
      return {
        subject: "Thank you for contacting World Bridge Meridian",
        heading: "Thank you for getting in touch",
        intro: "Your message has reached our team, and a member of the team will reply to you personally.",
        steps: [],
      };
  }
}

type StaffRow = { email: string; name: string | null; role: string };

/** info@, every admin, and the staff member looking after this client (if any). */
async function team(clientEmail: string): Promise<{ to: string[]; coordinator?: StaffRow }> {
  const to = new Set([INTERNAL_EMAIL]);
  const rest = async <T>(path: string): Promise<T[]> => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    return res.ok ? ((await res.json()) as T[]) : [];
  };
  try {
    const [staff, assigned] = await Promise.all([
      rest<StaffRow>("staff_members?select=email,name,role"),
      rest<{ staff_email: string }>(`client_assignments?select=staff_email&client_email=eq.${encodeURIComponent(clientEmail.toLowerCase())}`),
    ]);
    for (const s of staff) if (s.role === "admin") to.add(s.email);
    const coordinator = staff.find((s) => s.email === assigned[0]?.staff_email);
    if (coordinator) to.add(coordinator.email);
    return { to: [...to], coordinator };
  } catch (err) {
    console.error("team lookup failed", err);
    return { to: [...to] };
  }
}

async function sendEmail(to: string | string[], subject: string, html: string, replyTo: string[], signature?: Signature) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: layout(html, signature),
      reply_to: replyTo,
    }),
  });
  if (!res.ok) {
    console.error("Resend send failed", res.status, await res.text());
  }
}

Deno.serve(async (req: Request) => {
  if (!NOTIFY_SHARED_SECRET || req.headers.get("x-wbm-notify-secret") !== NOTIFY_SHARED_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const record: FormRecord = payload.record ?? payload;
    // Card orders are created by epv-webhook after payment, which sends its own emails.
    if (record.payload?.payment_method === "card") {
      return new Response(JSON.stringify({ ok: true, skipped: "card order" }), { headers: { "Content-Type": "application/json" } });
    }
    const requestType = String(record.payload?.requestType ?? "");
    const label = record.form_type === "journey-request" && requestType ? `${requestType} request` : LABELS[record.form_type] ?? "Website form";
    const about = topic(record);
    const newsletter = record.form_type === "newsletter";
    const { to, coordinator } = newsletter ? { to: [INTERNAL_EMAIL], coordinator: undefined } : await team(record.email);
    const button = (href: string, text: string) =>
      `<p style="margin:28px 0"><a href="${href}" style="background:#1c1c1c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:${FONT};font-size:13px;letter-spacing:.05em;text-transform:uppercase">${esc(text)}</a></p>`;

    await sendEmail(
      to,
      `${label}${about ? `: ${about}` : ""}${record.name ? ` — ${record.name}` : ""}`,
      `
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f">${esc(label)}</p>
        <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.35">${esc(about || record.subject || record.name || record.email)}</h2>
        <table role="presentation" style="border-collapse:collapse;width:100%">
          ${rows([["Client", record.name || "(not provided)"], ["Email", record.email], ["Looked after by", coordinator ? coordinator.name || coordinator.email : newsletter ? "" : "Not assigned yet"], ["Subject", record.form_type === "contact" ? record.subject : ""], ["Submitted", new Date(record.submitted_at).toUTCString()]])}
        </table>
        ${details(record, false)}
        ${record.message ? `<h3 ${H3}>${record.form_type === "contact" ? "Message" : "Notes from the client"}</h3><p style="white-space:pre-wrap;margin:0;font-size:14px">${esc(record.message)}</p>` : ""}
        ${newsletter ? "" : button(`${STAFF_URL}?client=${encodeURIComponent(record.email.toLowerCase())}#clients`, "Open this client")}
        <p style="color:#888;font-size:12px">Reply to this email to answer them directly. It's also on the staff page under Requests.</p>
      `,
      [record.email],
    );

    // Real push notification to the admins and the staff member looking after this client.
    if (!newsletter) {
      await pushToTeam(createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }), record.email, {
        title: `New ${label}${record.name ? ` from ${record.name}` : ""}`,
        body: about || record.subject || "Open the staff page to see it",
        url: `/staff?client=${encodeURIComponent(record.email.toLowerCase())}#clients`,
        tag: `request-${record.email.toLowerCase()}`,
      });
    }

    // Acknowledge the sender, except for the newsletter: that one is a
    // marketing list, and a signup confirmation belongs in the list
    // tooling rather than here.
    if (!newsletter) {
      const c = copy(record);
      const first = (record.name ?? "").trim().split(/\s+/)[0];
      await sendEmail(
        record.email,
        `${c.subject} — World Bridge Meridian`,
        `
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f">${esc(c.heading)}</p>
          <p>${first ? `Dear ${esc(first)},` : "Hello,"}</p>
          <p>${c.intro}</p>
          ${coordinator ? `<p>${esc(coordinator.name || "Your travel coordinator")} is looking after your request and will be in touch personally.</p>` : ""}
          ${details(record, true)}
          ${record.message ? `<h3 ${H3}>${record.form_type === "contact" ? "Your message" : "Your notes"}</h3><p style="white-space:pre-wrap;margin:0;color:#55504a">${esc(record.message)}</p>` : ""}
          ${c.steps.length ? `<h3 ${H3}>What happens next</h3><ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.7">${c.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
          ${button(`${ACCOUNT_URL}#enquiries`, "View your request")}
          <p style="color:#55504a">You can reply to this email at any time.</p>
        `,
        coordinator ? [coordinator.email, INTERNAL_EMAIL] : [INTERNAL_EMAIL],
        staffSignature(coordinator),
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
