import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Starts a card payment for one of the signed-in client's own invoices.
// The amount always comes from the database, never from the browser.
// Secrets (Edge Functions -> Secrets): EPV_API_KEY, TURNSTILE_SECRET_KEY. Never put them in this file.
const EPV_API_KEY = Deno.env.get("EPV_API_KEY");
const EPV_BASE = Deno.env.get("EPV_BASE_URL") ?? "https://pay.epayvista.com"; // sandbox: https://pay.epayvista.com/sandbox
const EPV_CURRENCY = Deno.env.get("EPV_CURRENCY") ?? "USDC"; // sandbox: TUSDC
const EPV_CHAIN = Deno.env.get("EPV_CHAIN") ?? "base";
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
    .select("id, reference, description, amount_usd, status, card_url")
    .eq("id", body.invoiceId)
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (!invoice) return json(404, { ok: false, error: "We couldn't find that invoice." });
  if (invoice.status === "paid") return json(409, { ok: false, error: "This invoice has already been paid." });
  if (invoice.status === "void") return json(409, { ok: false, error: "This invoice was cancelled." });
  if (invoice.status === "needs_review") return json(409, { ok: false, error: "We're checking a payment on this invoice. We'll be in touch." });

  // Same customerID + chain + currency returns the existing session, so retrying is safe.
  const res = await fetch(`${EPV_BASE}/api/v1/payment`, {
    method: "POST",
    headers: { "API-Key": EPV_API_KEY, "Content-Type": "application/json", "User-Agent": "WorldBridgeMeridian-Invoices/1.0" },
    body: JSON.stringify({
      customerID: invoice.reference,
      amountInUSD: Number(invoice.amount_usd),
      customerEmail: u.user.email,
      blockchainCode: EPV_CHAIN,
      currencyCode: EPV_CURRENCY,
      returnUrl: `${SITE_URL}/my-world-bridge#invoices`,
      cancelUrl: `${SITE_URL}/my-world-bridge#invoices`,
      orderSummary: `${invoice.reference} — ${invoice.description}`.slice(0, 1000),
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

  await db.from("invoices").update({ card_reference: created.reference_id, card_url: created.url }).eq("id", invoice.id);
  return json(200, { ok: true, url: created.url });
});
