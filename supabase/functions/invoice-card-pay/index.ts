import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Starts a card payment for one of the signed-in client's own invoices.
// The amount always comes from the database, never from the browser.
// EUR / GBP invoices are converted to US dollars here, at the live rate, the moment the client taps pay.
// Secrets (Edge Functions -> Secrets): EPV_API_KEY, TURNSTILE_SECRET_KEY. Never put them in this file.
const EPV_API_KEY = Deno.env.get("EPV_API_KEY");
const EPV_BASE = Deno.env.get("EPV_BASE_URL") ?? "https://pay.epayvista.com"; // sandbox: https://pay.epayvista.com/sandbox
const EPV_CURRENCY = Deno.env.get("EPV_CURRENCY") ?? "USDC"; // sandbox: TUSDC
const EPV_CHAIN = Deno.env.get("EPV_CHAIN") ?? "base";
const REUSE_MS = 20 * 60 * 1000; // a client who taps Pay again within this time gets the same checkout
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://worldbridgemeridian.com";
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

/** Live rate: 1 unit of `from` in US dollars. Coinbase spot price (moves all day), falling back to the European Central Bank daily rate. Null if both fail. */
async function liveUsdRate(from: string): Promise<number | null> {
  const ok = (r: number) => (r > 0 && r < 1000 ? r : null);
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${from}-USD/spot`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const r = ok(Number(((await res.json()) as { data?: { amount?: string } }).data?.amount));
      if (r) return r;
    }
  } catch {
    // fall through to the ECB rate
  }
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=USD`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return ok(Number(((await res.json()) as { rates?: { USD?: number } }).rates?.USD));
  } catch {
    return null;
  }
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json(405, { ok: false, error: "method not allowed" });
  if (!EPV_API_KEY || !TURNSTILE_SECRET_KEY) return json(500, { ok: false, error: "Card payments aren't available right now." });

  let body: { invoiceId?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid body" });
  }
  if (!body.invoiceId || !/^[0-9a-f-]{36}$/i.test(body.invoiceId)) return json(400, { ok: false, error: "invalid invoice" });
  if (!body.token || !(await verifyTurnstile(body.token, req.headers.get("cf-connecting-ip")))) {
    return json(403, { ok: false, error: "Verification failed. Please refresh the page and try again." });
  }

  // Who is really calling: the signed-in client, with a confirmed email.
  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: u } = await asUser.auth.getUser();
  if (!u.user?.email || !u.user.email_confirmed_at) return json(401, { ok: false, error: "Please sign in to your account to continue." });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: invoice } = await db
    .from("invoices")
    .select("id, reference, description, amount_usd, status, card_url, currency, amount, fx_rate")
    .eq("id", body.invoiceId)
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (!invoice) return json(404, { ok: false, error: "We couldn't find that invoice." });
  if (invoice.status === "paid") return json(409, { ok: false, error: "This invoice has already been paid." });
  if (invoice.status === "void") return json(409, { ok: false, error: "This invoice was cancelled." });
  if (invoice.status === "needs_review") return json(409, { ok: false, error: "We're checking a payment on this invoice. We'll be in touch." });

  // One payment per invoice. Every checkout session is recorded (invoice_card_sessions).
  // A client who taps Pay again within a few minutes is sent back to the very same checkout. Once a checkout has gone stale
  // (or the dollar amount has really moved) it is marked cancelled in our records and the next tap opens a fresh one under a new random reference. A cancelled session stays on file, so a late payment on it still finds its invoice.
  const { data: sessionRows } = await db
    .from("invoice_card_sessions")
    .select("reference_id, amount_usd, created_at, cancelled_at")
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: false });
  const sessions = (sessionRows ?? []) as { reference_id: string; amount_usd: number; created_at: string; cancelled_at: string | null }[];
  const latest = sessions.find((x) => !x.cancelled_at);

  // Today's amount in US dollars. USD invoices keep their amount. If the rate service is down we use the rate saved on the invoice.
  let amountUsd = Number(invoice.amount_usd);
  let rate: number | null = null;
  if (invoice.currency && invoice.currency !== "USD" && Number(invoice.amount) > 0) {
    rate = (await liveUsdRate(invoice.currency)) ?? Number(invoice.fx_rate);
    const usd = Math.round(Number(invoice.amount) * rate * 100) / 100;
    if (usd >= 5) amountUsd = usd;
  }
  const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.5, b * 0.005);

  if (latest && invoice.card_url && Date.now() - new Date(latest.created_at).getTime() < REUSE_MS && close(Number(latest.amount_usd), amountUsd)) {
    return json(200, { ok: true, url: invoice.card_url, reused: true });
  }

  // The old checkout is finished with: clear it from our records before opening the next one.
  if (latest) await db.from("invoice_card_sessions").update({ cancelled_at: new Date().toISOString() }).eq("invoice_id", invoice.id).is("cancelled_at", null);

  // Every checkout gets its own random reference, so ePayVista never hands back an old session for the same invoice.
  // Our invoice_card_sessions table ties it back to the invoice.
  const customerId = `WBM-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const res = await fetch(`${EPV_BASE}/api/v1/payment`, {
    method: "POST",
    headers: { "API-Key": EPV_API_KEY, "Content-Type": "application/json", "User-Agent": "WorldBridgeMeridian-Invoices/1.0" },
    body: JSON.stringify({
      customerID: customerId,
      amountInUSD: amountUsd,
      customerEmail: u.user.email,
      blockchainCode: EPV_CHAIN,
      currencyCode: EPV_CURRENCY,
      returnUrl: `${SITE_URL}/my-world-bridge#invoices`,
      cancelUrl: `${SITE_URL}/my-world-bridge#invoices`,
      orderSummary: `${customerId} \u2014 ${invoice.description}`.slice(0, 1000),
    }),
  });
  if (!res.ok) {
    console.error("ePayVista create payment failed", res.status, await res.text());
    return json(502, { ok: false, error: "The card payment provider couldn't start this payment. Please try again, or pay by bank transfer or crypto." });
  }
  const created: { url?: string; reference_id?: string } = await res.json();
  if (!created.url || !created.reference_id || !created.url.startsWith("https://pay.epayvista.com/")) {
    console.error("ePayVista unexpected response", JSON.stringify(created).slice(0, 300));
    return json(502, { ok: false, error: "The card payment provider returned something unexpected. Please try again later." });
  }

  // The provider may hand back the checkout it already has for this invoice number. Then that one is live again, at its own amount.
  const known = sessions.find((x) => x.reference_id === created.reference_id);
  const sessionAmount = known ? Number(known.amount_usd) : amountUsd;
  if (known) {
    await db.from("invoice_card_sessions").update({ cancelled_at: null }).eq("reference_id", created.reference_id);
  } else {
    await db.from("invoice_card_sessions").insert({ reference_id: created.reference_id, invoice_id: invoice.id, customer_id: customerId, amount_usd: amountUsd });
  }
  await db
    .from("invoices")
    .update({ card_reference: created.reference_id, card_url: created.url, amount_usd: sessionAmount, ...(rate && !known ? { fx_rate: rate } : {}) })
    .eq("id", invoice.id);
  return json(200, { ok: true, url: created.url });
});
