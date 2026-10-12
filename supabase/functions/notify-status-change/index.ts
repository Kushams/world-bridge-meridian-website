import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { FONT, layout, requestNoun, requestTopic, staffSignature } from "../_shared/email.ts";

// Called by the database trigger in supabase/status-emails.sql whenever a
// request's `status` changes. Same shared-secret check as
// notify-form-submission: the anon key alone proves nothing.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const REPLY_TO = "info@worldbridgemeridian.group";
const ACCOUNT_URL = "https://worldbridgemeridian.com/my-world-bridge";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Status = "received" | "in_review" | "proposal_sent" | "confirmed" | "closed";

interface FormRecord {
  id: string;
  form_type: string;
  name: string | null;
  email: string;
  subject: string | null;
  payload: Record<string, unknown> | null;
  status: Status;
}

type StaffRow = { email: string; name: string | null; role: string };

/** The staff member looking after this client, if one is assigned. */
async function coordinatorOf(clientEmail: string): Promise<StaffRow | undefined> {
  const rest = async <T>(path: string): Promise<T[]> => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    });
    return res.ok ? ((await res.json()) as T[]) : [];
  };
  try {
    const [a] = await rest<{ staff_email: string }>(`client_assignments?select=staff_email&client_email=eq.${encodeURIComponent(clientEmail.toLowerCase())}`);
    if (!a) return undefined;
    const [s] = await rest<StaffRow>(`staff_members?select=email,name,role&email=eq.${encodeURIComponent(a.staff_email)}`);
    return s;
  } catch (err) {
    console.error("coordinator lookup failed", err);
    return undefined;
  }
}

// `received` is the automatic first state (the submission email covers it) and
// `closed` is deliberately silent, so staff can tidy up without emailing anyone.
const MESSAGES: Partial<Record<Status, { subject: string; headline: string; body: string }>> = {
  in_review: {
    subject: "We're working on your request — World Bridge Meridian",
    headline: "Your consultant is reviewing your request",
    body: "Your consultant has started working on your request and will be in touch shortly with next steps.",
  },
  proposal_sent: {
    subject: "Your proposal is ready — World Bridge Meridian",
    headline: "Your proposal is ready",
    body: "Your consultant has prepared a proposal for you. Please check your email and your account for the details, and reply to this message with any questions.",
  },
  confirmed: {
    subject: "Your journey is confirmed — World Bridge Meridian",
    headline: "Your journey is confirmed",
    body: "Wonderful news: your journey is confirmed. Your consultant will send payment instructions and your next steps.",
  },
};

/** Exhibition trips get their own wording; everything else reads as a journey. */
const EXHIBITION_MESSAGES: Partial<Record<Status, { subject: string; headline: string; body: string }>> = {
  in_review: {
    subject: "We're planning your exhibition visit — World Bridge Meridian",
    headline: "Your exhibition visit is being planned",
    body: "Your travel coordinator is confirming exhibition dates and access, and planning your travel and stay around them. They will be in touch shortly.",
  },
  proposal_sent: {
    subject: "Your exhibition itinerary is ready — World Bridge Meridian",
    headline: "Your exhibition itinerary and quote are ready",
    body: "Your travel coordinator has prepared your itinerary and quote. Please review them in your account, and reply to this message with any questions.",
  },
  confirmed: {
    subject: "Your exhibition trip is confirmed — World Bridge Meridian",
    headline: "Your exhibition trip is confirmed",
    body: "Wonderful news: your exhibition trip is confirmed. Your travel coordinator will send payment instructions and your next steps.",
  },
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    // A confirmed Travel Credits purchase gets its own message; other statuses on those rows are silent.
    const message =
      record.form_type === "travel-credits"
        ? record.status === "confirmed"
          ? {
              subject: "Your Travel Credits have been added — World Bridge Meridian",
              headline: "Your Travel Credits are ready",
              body: "We've verified your payment and added the credits to your account. Your consultant can apply them to your next journey.",
            }
          : undefined
        : (record.form_type === "travel-details" ? EXHIBITION_MESSAGES : MESSAGES)[record.status];
    if (!message || !record.email) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const about = requestTopic(record);
    const coordinator = await coordinatorOf(record.email);
    const subject = about ? message.subject.replace(" — World Bridge Meridian", `: ${about} — World Bridge Meridian`) : message.subject;
    const html = `
      <div style="color:#222;max-width:560px">
        <p>Hi ${esc(record.name || "there")},</p>
        <h2 style="font-family:${FONT};font-weight:500;font-size:20px;margin:16px 0 8px">${esc(message.headline)}</h2>
        <p>${esc(message.body)}</p>
        ${about || record.subject ? `<p style="color:#666">Regarding your ${esc(requestNoun(record))}: <strong style="color:#1c1c1c">${esc(about || record.subject)}</strong></p>` : ""}
        <p><a href="${ACCOUNT_URL}" style="display:inline-block;background:#1c1a17;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">View in My World Bridge</a></p>
        <p style="color:#888;font-size:13px">Sign in with this email address to see your request and its progress. Just reply to this email to reach ${esc(coordinator?.name || "your consultant")}.</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [record.email],
        subject,
        html: layout(html, staffSignature(coordinator)),
        reply_to: coordinator ? [coordinator.email, REPLY_TO] : [REPLY_TO],
      }),
    });
    if (!res.ok) console.error("Resend send failed", res.status, await res.text());

    return new Response(JSON.stringify({ ok: res.ok }), {
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
