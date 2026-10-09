import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Turnstile secret is a function secret, never in source. The service role
// key is injected by the platform; with the anon insert policy removed
// (supabase/turnstile.sql), this function is the only way to add a row.
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FORM_TYPES = ["contact", "newsletter", "journey-request", "travel-details", "gift-card", "travel-credits"] as const;
// Money forms need a signed-in customer with a confirmed email.
const ACCOUNT_REQUIRED: readonly string[] = ["gift-card", "travel-credits", "journey-request", "contact", "travel-details"];
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
type FormType = (typeof FORM_TYPES)[number];

// Besides forms, this function is the Turnstile-checked entry for the other places money
// moves: sending a crypto payment reference and redeeming a gift card or voucher code.
type Action = "form" | "crypto-payment" | "redeem-gift-card";

interface SubmitBody {
  action?: Action;
  token?: string;
  formType?: FormType;
  email?: string;
  name?: string | null;
  subject?: string | null;
  message?: string | null;
  payload?: Record<string, unknown>;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.append("secret", TURNSTILE_SECRET_KEY!);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const outcome: { success: boolean } = await res.json();
  return outcome.success;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function saveCryptoPayment(p: Record<string, unknown>) {
  const asset = str(p.asset, 40);
  const network = str(p.network, 60);
  const wallet = str(p.walletAddress, 200);
  const hash = str(p.transactionHash, 200);
  if (!asset || !network || !wallet || !hash) return json(400, { ok: false, error: "invalid submission" });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { error } = await supabase.from("crypto_payment_submissions").insert({
    asset,
    network,
    wallet_address: wallet,
    transaction_hash: hash,
    payer_name: str(p.payerName, 200) || null,
    payer_email: str(p.payerEmail, 200) || null,
    lead_id: str(p.leadId, 80) || null,
    notes: str(p.notes, 2000) || null,
    status: "pending_verification",
  });
  if (error) {
    if (error.code === "23505") return json(409, { ok: false, error: "We've already received this transaction reference." });
    if (error.code === "53400") return json(429, { ok: false, error: error.message });
    return json(500, { ok: false, error: "could not save submission" });
  }
  return json(200, { ok: true });
}

async function redeemGiftCard(req: Request, p: Record<string, unknown>) {
  const code = str(p.code, 64);
  if (!code) return json(400, { ok: false, error: "invalid submission" });
  // Runs as the signed-in customer, so the database function sees their own account.
  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: u } = await asUser.auth.getUser();
  if (!u.user?.email || !u.user.email_confirmed_at) {
    return json(401, { ok: false, error: "Please sign in to your account to continue." });
  }
  const { data, error } = await asUser.rpc("redeem_gift_card", { p_code: code });
  if (error) return json(500, { ok: false, error: "could not redeem" });
  return json(200, { ok: true, result: Array.isArray(data) ? data[0] : data });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json(405, { ok: false, error: "method not allowed" });
  if (!TURNSTILE_SECRET_KEY) return json(500, { ok: false, error: "not configured" });

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid body" });
  }

  const action: Action = body.action ?? "form";
  if (!["form", "crypto-payment", "redeem-gift-card"].includes(action)) {
    return json(400, { ok: false, error: "invalid submission" });
  }
  if (action === "form" && (!body.formType || !FORM_TYPES.includes(body.formType) || !body.email)) {
    return json(400, { ok: false, error: "invalid submission" });
  }
  if (!body.token || !(await verifyTurnstile(body.token, req.headers.get("cf-connecting-ip")))) {
    return json(403, { ok: false, error: "Verification failed. Please refresh the page and try again." });
  }

  if (action === "crypto-payment") return await saveCryptoPayment(body.payload ?? {});
  if (action === "redeem-gift-card") return await redeemGiftCard(req, body.payload ?? {});

  let email = body.email!;
  if (ACCOUNT_REQUIRED.includes(body.formType!)) {
    // verify_jwt only proves the caller has *a* JWT (the public anon key is one),
    // so ask Auth who the user actually is.
    const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      auth: { persistSession: false },
    });
    const { data } = await asUser.auth.getUser();
    if (!data.user?.email || !data.user.email_confirmed_at) {
      return json(401, { ok: false, error: "Please sign in to your account to continue." });
    }
    email = data.user.email; // always the account's own email, never the form's
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("form_submissions").insert({
    form_type: body.formType,
    name: body.name || null,
    email,
    subject: body.subject || null,
    message: body.message || null,
    payload: body.payload ?? {},
  });

  if (error) {
    // 53400 is the submission rate limit in supabase/forms.sql; its
    // message is written for the visitor to read.
    if (error.code === "53400") return json(429, { ok: false, error: error.message });
    return json(500, { ok: false, error: "could not save submission" });
  }
  return json(200, { ok: true });
});
