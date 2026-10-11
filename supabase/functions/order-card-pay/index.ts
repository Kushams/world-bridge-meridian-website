import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Starts a card payment for a Travel Credits or gift card order from the signed-in client.
// The order is checked and priced here, saved as an invoices row, and fulfilled by epv-webhook once paid.
// Secrets (Edge Functions -> Secrets): EPV_API_KEY, TURNSTILE_SECRET_KEY. Never put them in this file.
const EPV_API_KEY = Deno.env.get("EPV_API_KEY");
const EPV_BASE = Deno.env.get("EPV_BASE_URL") ?? "https://pay.epayvista.com";
const EPV_CURRENCY = Deno.env.get("EPV_CURRENCY") ?? "USDC";
const EPV_CHAIN = Deno.env.get("EPV_CHAIN") ?? "base";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://worldbridgemeridian.com";
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Same limits as the crypto order forms and the issue_* database triggers.
const MIN_USD = 500;
const MAX_TOTAL_USD = 25000;
const MAX_GIFT_QTY = 100;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append("secret", TURNSTILE_SECRET_KEY!);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const outcome: { success: boolean } = await res.json();
  return outcome.success;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isCents = (n: number) => Number.isFinite(n) && Math.round(n * 100) === n * 100;
const fmt = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface OrderBody {
  kind?: string;
  amount?: number;
  quantity?: number;
  name?: string;
  design?: string;
  sendAsGift?: boolean;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  acceptedTerms?: boolean;
  token?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json(405, { ok: false, error: "method not allowed" });
  if (!EPV_API_KEY || !TURNSTILE_SECRET_KEY) return json(500, { ok: false, error: "Card payments aren't available right now." });

  let body: OrderBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid body" });
  }
  if (!body.token || !(await verifyTurnstile(body.token, req.headers.get("cf-connecting-ip")))) {
    return json(403, { ok: false, error: "Verification failed. Please refresh the page and try again." });
  }
  if (body.acceptedTerms !== true) return json(400, { ok: false, error: "Please accept the terms to continue." });

  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: u } = await asUser.auth.getUser();
  if (!u.user?.email || !u.user.email_confirmed_at) return json(401, { ok: false, error: "Please sign in to your account to continue." });

  const amount = Number(body.amount);
  const name = text(body.name, 120);
  let kind: "travel-credits" | "gift-card";
  let total: number;
  let description: string;
  let details: Record<string, string>;
  let back: string;

  if (body.kind === "travel-credits") {
    if (!isCents(amount) || amount < MIN_USD || amount > MAX_TOTAL_USD) {
      return json(400, { ok: false, error: `Please choose an amount between ${fmt(MIN_USD)} and ${fmt(MAX_TOTAL_USD)}.` });
    }
    kind = "travel-credits";
    total = amount;
    description = `Travel Credits — ${fmt(amount)}`;
    details = { name, amount: String(amount), accepted_credit_terms: "yes" };
    back = "/travel-credits#buy";
  } else if (body.kind === "gift-card") {
    const qty = Number(body.quantity);
    const asGift = body.sendAsGift === true;
    const rName = text(body.recipientName, 120);
    const rEmail = text(body.recipientEmail, 254).toLowerCase();
    if (!isCents(amount) || amount < MIN_USD || !Number.isInteger(qty) || qty < 1 || qty > MAX_GIFT_QTY || amount * qty > MAX_TOTAL_USD) {
      return json(400, { ok: false, error: `Please choose an amount of at least ${fmt(MIN_USD)}, and a total no higher than ${fmt(MAX_TOTAL_USD)}.` });
    }
    if (asGift && (!rName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail))) {
      return json(400, { ok: false, error: "Please enter the recipient's name and a valid email." });
    }
    kind = "gift-card";
    total = Math.round(amount * qty * 100) / 100;
    description = `Gift card${qty > 1 ? "s" : ""} — ${qty} × ${fmt(amount)}`;
    details = {
      name,
      amount: String(amount),
      quantity: String(qty),
      total_usd: String(total),
      design: body.design === "seasonal" ? "seasonal" : "classic",
      send_as_gift: asGift ? "yes" : "no",
      recipient_name: asGift ? rName : "",
      recipient_email: asGift ? rEmail : "",
      gift_message: asGift ? text(body.message, 500) : "",
      accepted_gift_card_terms: "yes",
    };
    back = "/gift-cards#buy";
  } else {
    return json(400, { ok: false, error: "invalid order" });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: order, error: insertError } = await db
    .from("invoices")
    .insert({ user_id: u.user.id, kind, description, amount_usd: total, order_details: details })
    .select("id, reference")
    .single();
  if (insertError || !order) {
    console.error("order insert failed", insertError?.message);
    return json(500, { ok: false, error: "We couldn't start your order. Please try again." });
  }

  const res = await fetch(`${EPV_BASE}/api/v1/payment`, {
    method: "POST",
    headers: { "API-Key": EPV_API_KEY, "Content-Type": "application/json", "User-Agent": "WorldBridgeMeridian-Orders/1.0" },
    body: JSON.stringify({
      customerID: order.reference,
      amountInUSD: total,
      customerEmail: u.user.email,
      blockchainCode: EPV_CHAIN,
      currencyCode: EPV_CURRENCY,
      returnUrl: `${SITE_URL}/my-world-bridge#wallet`,
      cancelUrl: `${SITE_URL}${back}`,
      orderSummary: `${order.reference} — ${description}`.slice(0, 1000),
    }),
  });
  if (!res.ok) {
    console.error("ePayVista create payment failed", res.status, await res.text());
    await db.from("invoices").update({ status: "void" }).eq("id", order.id);
    return json(502, { ok: false, error: "The card payment provider couldn't start this payment. Please try again, or pay with crypto." });
  }
  const created: { url?: string; reference_id?: string } = await res.json();
  if (!created.url || !created.reference_id || !created.url.startsWith("https://pay.epayvista.com/")) {
    console.error("ePayVista unexpected response", JSON.stringify(created).slice(0, 300));
    await db.from("invoices").update({ status: "void" }).eq("id", order.id);
    return json(502, { ok: false, error: "The card payment provider returned something unexpected. Please try again later." });
  }

  await db.from("invoices").update({ card_reference: created.reference_id, card_url: created.url }).eq("id", order.id);
  return json(200, { ok: true, url: created.url });
});
