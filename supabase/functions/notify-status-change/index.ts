import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Called by the database trigger in supabase/status-emails.sql whenever a
// request's `status` changes. Same shared-secret check as
// notify-form-submission: the anon key alone proves nothing.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const REPLY_TO = "info@worldbridgemeridian.group";
const ACCOUNT_URL = "https://worldbridgemeridian.com/my-world-bridge";

type Status = "received" | "in_review" | "proposal_sent" | "confirmed" | "closed";

interface FormRecord {
  id: string;
  form_type: string;
  name: string | null;
  email: string;
  subject: string | null;
  status: Status;
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
        : MESSAGES[record.status];
    if (!message || !record.email) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#222;max-width:560px">
        <p>Hi ${esc(record.name || "there")},</p>
        <h2 style="font-family:Georgia,serif;font-weight:normal;margin:16px 0 8px">${esc(message.headline)}</h2>
        <p>${esc(message.body)}</p>
        ${record.subject ? `<p style="color:#666">Regarding: ${esc(record.subject)}</p>` : ""}
        <p><a href="${ACCOUNT_URL}" style="display:inline-block;background:#1c1a17;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px">View in My World Bridge</a></p>
        <p style="color:#888;font-size:13px">Sign in with this email address to see your request and its progress. Just reply to this email to reach your consultant.</p>
        <p>— World Bridge Meridian</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [record.email],
        subject: message.subject,
        html,
        reply_to: REPLY_TO,
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
