import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Set as function secrets, never in source. Shared with the database
// trigger in supabase/forms.sql, which sends the secret as
// x-wbm-notify-secret — the anon key alone proves nothing, it ships in
// the site's JS bundle.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";

type FormType = "contact" | "newsletter" | "journey-request" | "travel-details";

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
  "travel-details": "Exhibition travel itinerary form",
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

function payloadRows(payload: Record<string, unknown> | null): string {
  if (!payload) return "";
  return Object.entries(payload)
    .filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;vertical-align:top;color:#666">${esc(humanize(k))}</td><td style="padding:4px 0">${esc(
          Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : v,
        )}</td></tr>`,
    )
    .join("");
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
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
    const label = LABELS[record.form_type] ?? "Website form";

    await sendEmail(
      INTERNAL_EMAIL,
      `${label}${record.name ? ` — ${record.name}` : ""}`,
      `
        <h2>${esc(label)}</h2>
        <table style="font:14px/1.5 -apple-system,Segoe UI,sans-serif;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td style="padding:4px 0">${esc(record.name || "(not provided)")}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td style="padding:4px 0">${esc(record.email)}</td></tr>
          ${record.subject ? `<tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td style="padding:4px 0">${esc(record.subject)}</td></tr>` : ""}
          <tr><td style="padding:4px 12px 4px 0;color:#666">Submitted</td><td style="padding:4px 0">${esc(record.submitted_at)}</td></tr>
          ${payloadRows(record.payload)}
        </table>
        ${record.message ? `<p style="white-space:pre-wrap;margin-top:16px">${esc(record.message)}</p>` : ""}
        <p style="color:#888;font-size:12px">Reply to this email to answer them directly. Full record in Supabase → Table Editor → form_submissions (${esc(record.id)}).</p>
      `,
      record.email,
    );

    // Acknowledge the sender, except for the newsletter: that one is a
    // marketing list, and a signup confirmation belongs in the list
    // tooling rather than here.
    if (record.form_type !== "newsletter") {
      await sendEmail(
        record.email,
        record.form_type === "journey-request"
          ? "We've received your journey request — World Bridge Meridian"
          : record.form_type === "travel-details"
            ? "We've received your travel itinerary form — World Bridge Meridian"
            : "Thank you for contacting World Bridge Meridian",
        `
          <p>Hi ${esc(record.name || "there")},</p>
          <p>Thank you for reaching out. Your ${record.form_type === "journey-request" ? "journey request" : record.form_type === "travel-details" ? "travel detail form" : "message"} has reached our team and a consultant will be in touch personally.</p>
          ${record.message ? `<p style="color:#666">Your message:</p><blockquote style="white-space:pre-wrap;border-left:2px solid #ddd;padding-left:12px;color:#666">${esc(record.message)}</blockquote>` : ""}
          <p>— World Bridge Meridian</p>
        `,
        INTERNAL_EMAIL,
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
