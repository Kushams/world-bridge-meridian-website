import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Called by the database trigger in supabase/gift-cards.sql once staff confirm
// a gift card order's payment. Emails each card's code to its recipient (and a
// code-free receipt to the buyer when it is a gift). Same shared-secret check
// as notify-form-submission.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const REPLY_TO = "info@worldbridgemeridian.group";
const REDEEM_URL = "https://worldbridgemeridian.com/my-world-bridge#travel-credits";

function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const usd = (cents: number) => `US$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

async function send(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, reply_to: REPLY_TO }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (!NOTIFY_SHARED_SECRET || req.headers.get("x-wbm-notify-secret") !== NOTIFY_SHARED_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403 });
  }
  try {
    const { submission_id } = await req.json();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
    const { data: cards, error } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("submission_id", submission_id)
      .is("delivered_at", null);
    if (error) throw error;

    const wrap = (inner: string) =>
      `<div style="font:15px/1.6 -apple-system,Segoe UI,sans-serif;color:#222;max-width:560px">${inner}<p>— World Bridge Meridian</p></div>`;

    let sent = 0;
    for (const c of cards ?? []) {
      const isGift = c.recipient_email.toLowerCase() !== String(c.purchaser_email).toLowerCase();
      const ok = await send(
        c.recipient_email,
        isGift ? "You've received a World Bridge Meridian gift card" : "Your World Bridge Meridian gift card",
        wrap(`
          <p>Hi ${esc(c.recipient_name || "there")},</p>
          <p>${isGift ? `${esc(c.purchaser_name || "Someone")} has sent you` : "Here is"} a World Bridge Meridian gift card worth <b>${usd(c.amount_cents)}</b>. It never expires.</p>
          ${c.message ? `<blockquote style="border-left:2px solid #ddd;margin:16px 0;padding-left:12px;color:#555;white-space:pre-wrap">${esc(c.message)}</blockquote>` : ""}
          <p style="margin:20px 0"><span style="display:inline-block;background:#1c1a17;color:#fff;font:600 20px/1 monospace;letter-spacing:2px;padding:14px 20px;border-radius:10px">${esc(c.code)}</span></p>
          <p>To use it, sign in (or create an account) at <a href="${REDEEM_URL}">My World Bridge</a> and enter the code under <b>Travel Credits</b>. The value is added to your Travel Credits, which never expire and can be used toward World Bridge Meridian journeys and services; your consultant applies them when you book.</p>
          <p style="color:#888;font-size:13px">Keep this code private: anyone who has it can add the card to their account. Terms: https://worldbridgemeridian.com/gift-card-terms</p>`),
      );
      if (ok) {
        await supabase.from("gift_cards").update({ delivered_at: new Date().toISOString() }).eq("id", c.id);
        sent++;
      }
    }

    // Receipt for the buyer when the cards went to someone else (no codes included).
    const gifts = (cards ?? []).filter((c) => c.recipient_email.toLowerCase() !== String(c.purchaser_email).toLowerCase());
    if (gifts.length) {
      const first = gifts[0];
      await send(
        first.purchaser_email,
        "Your gift card has been sent — World Bridge Meridian",
        wrap(`<p>Hi ${esc(first.purchaser_name || "there")},</p>
          <p>Your payment has been confirmed and ${gifts.length} gift card${gifts.length > 1 ? "s" : ""} of ${usd(first.amount_cents)} ${gifts.length > 1 ? "have" : "has"} been emailed to ${esc(first.recipient_name || first.recipient_email)}.</p>`),
      );
    }

    return new Response(JSON.stringify({ ok: true, sent }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
