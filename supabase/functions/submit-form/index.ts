import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Turnstile secret is a function secret, never in source. The service role
// key is injected by the platform; with the anon insert policy removed
// (supabase/turnstile.sql), this function is the only way to add a row.
const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FORM_TYPES = ["contact", "newsletter", "journey-request"] as const;
type FormType = (typeof FORM_TYPES)[number];

interface SubmitBody {
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

  if (!body.formType || !FORM_TYPES.includes(body.formType) || !body.email) {
    return json(400, { ok: false, error: "invalid submission" });
  }
  if (!body.token || !(await verifyTurnstile(body.token, req.headers.get("cf-connecting-ip")))) {
    return json(403, { ok: false, error: "Verification failed. Please refresh the page and try again." });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await supabase.from("form_submissions").insert({
    form_type: body.formType,
    name: body.name || null,
    email: body.email,
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
