import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { layout } from "../_shared/email.ts";
import { pushToTeam } from "../_shared/push.ts";

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
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html: layout(html) }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
}

type Db = ReturnType<typeof createClient>;

// A paid Travel Credits / gift card order becomes a confirmed form_submissions row, so the
// existing database triggers add the credits or create and email the gift cards.
async function fulfilOrder(
  db: Db,
  invoice: { id: string; reference: string; kind: string; description: string; order_details: Record<string, string> | null },
  clientEmail: string,
  epvReference: string,
  txid: string,
): Promise<string> {
  const d = invoice.order_details ?? {};
  const { name, ...rest } = d;
  const { data: sub, error: insertError } = await db
    .from("form_submissions")
    .insert({
      form_type: invoice.kind,
      name: name || null,
      email: clientEmail,
      subject: `${invoice.description} (card, ${invoice.reference})`,
      message: invoice.kind === "gift-card" ? d.gift_message || null : null,
      payload: { ...rest, payment_method: "card", invoice_reference: invoice.reference, epv_reference: epvReference, transaction_hash: txid },
    })
    .select("id")
    .single();
  if (insertError || !sub) return insertError?.message ?? "could not record the order";
  await db.from("invoices").update({ submission_id: sub.id }).eq("id", invoice.id);
  const { error: confirmError } = await db.from("form_submissions").update({ status: "confirmed" }).eq("id", sub.id);
  return confirmError?.message ?? "";
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
  type Inv = { id: string; reference: string; user_id: string; description: string; amount_usd: number; status: string; kind: string; order_details: Record<string, string> | null; paid_txid?: string | null };
  const cols = "id, reference, user_id, description, amount_usd, status, kind, order_details, paid_txid";
  // Every checkout session we ever opened for an invoice is on file, so a payment on an older session still finds its invoice.
  const { data: session } = await db.from("invoice_card_sessions").select("invoice_id, amount_usd").eq("reference_id", msg.reference_id).maybeSingle<{ invoice_id: string; amount_usd: number }>();
  const { data: found } = session
    ? await db.from("invoices").select(cols).eq("id", session.invoice_id).maybeSingle<Inv>()
    : await db.from("invoices").select(cols).eq("card_reference", msg.reference_id).maybeSingle<Inv>();
  if (!found) return reply(200, { ok: true, unknown: true }); // not one of ours; 2xx stops retries
  // The amount this session asked for (which may differ from the invoice's latest dollar amount).
  const invoice: Inv = { ...found, amount_usd: session ? Number(session.amount_usd) : Number(found.amount_usd) };
  if (found.status === "paid") {
    // Same message again (ePayVista retries): ignore. A different transaction on an invoice already paid is a double payment.
    const txid = msg.txid || "";
    if (txid && found.paid_txid && txid !== found.paid_txid) {
      const { data: who } = await db.auth.admin.getUserById(found.user_id);
      const clientEmail = who.user?.email ?? "(unknown)";
      await email(
        INTERNAL_EMAIL,
        `Second payment received — ${found.reference}`,
        `<h2>An invoice that was already paid has been paid again</h2><p><strong>Invoice:</strong> ${found.reference} — ${found.description}</p><p><strong>Client:</strong> ${clientEmail}</p><p><strong>Second transaction:</strong> ${txid}</p><p>Please refund or credit the second payment in the ePayVista portal.</p>`,
      );
      await pushToTeam(db, who.user?.email ?? null, { title: "Double payment: refund needed", body: `${found.reference} · ${clientEmail}`, url: who.user?.email ? `/staff?client=${encodeURIComponent(who.user.email.toLowerCase())}#clients` : "/staff#alerts", tag: `double-${found.reference}` });
    }
    return reply(200, { ok: true, duplicate: true });
  }

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
      amount_usd: invoice.amount_usd,
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
    const txid = msg.txid || order.explorerTransaction || "";
    let fulfilError = "";
    if (status === "paid" && invoice.kind !== "invoice" && who.user?.email) {
      fulfilError = await fulfilOrder(db, invoice, who.user.email, msg.reference_id, txid);
      if (fulfilError) await db.from("invoices").update({ status: "needs_review" }).eq("id", invoice.id);
    }
    const details = `<p><strong>Invoice:</strong> ${invoice.reference} — ${invoice.description}</p>
      <p><strong>Amount:</strong> US$${Number(invoice.amount_usd).toFixed(2)}</p>
      <p><strong>Client:</strong> ${clientEmail}</p>
      <p><strong>Transaction:</strong> ${msg.txid || order.explorerTransaction || "(not provided)"}</p>`;
    if (fulfilError) {
      await email(
        INTERNAL_EMAIL,
        `Card order paid but not fulfilled — ${invoice.reference}`,
        `<h2>A paid card order needs finishing by hand</h2>${details}<p>Error: ${fulfilError.replace(/[<>&]/g, "")}</p><p>Fix the cause, then add the credits or gift cards from the SQL editor.</p>`,
      );
    } else if (status === "paid") {
      await email(INTERNAL_EMAIL, `Card payment received — ${invoice.reference}`, `<h2>Card payment received</h2>${details}`);
      await pushToTeam(db, who.user?.email ?? null, {
        title: `Payment received: US$${Number(invoice.amount_usd).toFixed(2)}`,
        body: `${invoice.reference} · ${clientEmail}`,
        url: who.user?.email ? `/staff?client=${encodeURIComponent(who.user.email.toLowerCase())}#clients` : "/staff#alerts",
        tag: `paid-${invoice.reference}`,
      });
      if (who.user?.email) {
        await email(
          who.user.email,
          `Payment received — ${invoice.reference}`,
          invoice.kind === "travel-credits"
            ? `<p>Thank you — we've received your card payment of US$${Number(invoice.amount_usd).toFixed(2)} (${invoice.reference}). Your Travel Credits are now in your account: https://worldbridgemeridian.com/my-world-bridge#wallet</p>`
            : invoice.kind === "gift-card"
              ? `<p>Thank you — we've received your card payment of US$${Number(invoice.amount_usd).toFixed(2)} (${invoice.reference}). The gift card code${invoice.order_details?.quantity === "1" ? " is" : "s are"} being emailed now.</p>`
              : `<p>Thank you — we've received your card payment for invoice ${invoice.reference} (US$${Number(invoice.amount_usd).toFixed(2)}). Your receipt is ready: sign in, open Invoices and tap Download receipt (https://worldbridgemeridian.com/my-world-bridge#invoices). Your consultant will confirm it with you in writing.</p>`,
        );
      }
    } else {
      await pushToTeam(db, who.user?.email ?? null, {
        title: "A card payment needs checking",
        body: `${invoice.reference} · ${clientEmail}`,
        url: who.user?.email ? `/staff?client=${encodeURIComponent(who.user.email.toLowerCase())}#clients` : "/staff#alerts",
        tag: `check-${invoice.reference}`,
      });
      await email(
        INTERNAL_EMAIL,
        `Card payment needs checking — ${invoice.reference}`,
        `<h2>A card payment doesn't match its invoice</h2>${details}<p>Provider says: state ${order.paymentState}, amount ${order.amountInUSD}. Check it in the ePayVista portal and update the invoice in Supabase (Table Editor -> invoices).</p>`,
      );
    }
  }
  return reply(200, { ok: true });
});
