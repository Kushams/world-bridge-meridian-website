import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Receives ePayVista's "order paid" message. Deploy with JWT verification OFF (they cannot send a Supabase JWT);
// the HMAC signature below is what proves the message is genuine.
// Secrets: EPV_CALLBACK_SECRET, EPV_API_KEY, RESEND_API_KEY. Optional: EPV_BASE_URL (sandbox testing).
const EPV_CALLBACK_SECRET = Deno.env.get("EPV_CALLBACK_SECRET");
const EPV_API_KEY = Deno.env.get("EPV_API_KEY");
const EPV_BASE = Deno.env.get("EPV_BASE_URL") ?? "https://pay.epayvista.com";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "World Bridge Meridian <payments@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";

const enc = new TextEncoder();
const reply = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function hmacHex(secret: string, raw: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, raw));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function email(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return reply(405, { ok: false });
  if (!EPV_CALLBACK_SECRET || !EPV_API_KEY) return reply(500, { ok: false });

  const raw = new Uint8Array(await req.arrayBuffer());
  const given = (req.headers.get("X-EPV-Signature") ?? "").toLowerCase();
  const expected = await hmacHex(EPV_CALLBACK_SECRET, raw);
  if (!safeEqual(given, expected)) return reply(401, { ok: false, error: "bad signature" });

  let msg: { reference_id?: string; status?: string; txid?: string; amount_in_usd?: string };
  try {
    msg = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return reply(400, { ok: false });
  }
  if (!msg.reference_id || msg.status !== "CLOSED") return reply(200, { ok: true, ignored: true });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: invoice } = await db
    .from("invoices")
    .select("id, reference, user_id, description, amount_usd, status")
    .eq("card_reference", msg.reference_id)
    .maybeSingle();
  if (!invoice) return reply(200, { ok: true, unknown: true }); // not one of ours; 2xx stops retries
  if (invoice.status === "paid") return reply(200, { ok: true, duplicate: true });

  // Don't trust the message alone: ask ePayVista for the order and check it is paid for the amount we invoiced.
  const check = await fetch(`${EPV_BASE}/api/v1/payment/reference/${encodeURIComponent(msg.reference_id)}`, {
    headers: { "API-Key": EPV_API_KEY, "User-Agent": "WorldBridgeMeridian-Invoices/1.0" },
  });
  if (!check.ok) return reply(502, { ok: false, error: "could not confirm" }); // non-2xx makes ePayVista retry
  const order: { paymentState?: string; amountInUSD?: string; explorerTransaction?: string | null } = await check.json();

  const sameAmount = Number(order.amountInUSD) === Number(invoice.amount_usd);
  const paid = order.paymentState === "FILLED";
  const status = paid && sameAmount ? "paid" : "needs_review";

  const { data: updated } = await db
    .from("invoices")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      paid_via: "card",
      paid_txid: msg.txid || order.explorerTransaction || null,
    })
    .eq("id", invoice.id)
    .neq("status", "paid")
    .select("id");

  if (updated && updated.length > 0) {
    const { data: who } = await db.auth.admin.getUserById(invoice.user_id);
    const clientEmail = who.user?.email ?? "(unknown)";
    const details = `<p><strong>Invoice:</strong> ${invoice.reference} — ${invoice.description}</p>
      <p><strong>Amount:</strong> US$${Number(invoice.amount_usd).toFixed(2)}</p>
      <p><strong>Client:</strong> ${clientEmail}</p>
      <p><strong>Transaction:</strong> ${msg.txid || order.explorerTransaction || "(not provided)"}</p>`;
    if (status === "paid") {
      await email(INTERNAL_EMAIL, `Card payment received — ${invoice.reference}`, `<h2>Card payment received</h2>${details}`);
      if (who.user?.email) {
        await email(
          who.user.email,
          `Payment received — ${invoice.reference}`,
          `<p>Thank you — we've received your card payment for invoice ${invoice.reference} (US$${Number(invoice.amount_usd).toFixed(2)}). Your consultant will confirm it with you in writing.</p>`,
        );
      }
    } else {
      await email(
        INTERNAL_EMAIL,
        `Card payment needs checking — ${invoice.reference}`,
        `<h2>A card payment doesn't match its invoice</h2>${details}<p>Provider says: state ${order.paymentState}, amount ${order.amountInUSD}. Check it in the ePayVista portal and update the invoice in Supabase (Table Editor -> invoices).</p>`,
      );
    }
  }
  return reply(200, { ok: true });
});
