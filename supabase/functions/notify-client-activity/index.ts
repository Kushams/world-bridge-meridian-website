import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Called by the website after a signed-in client uploads a document, signs one
// on screen, or returns a signed file. Emails the team. It never touches file
// contents. verify_jwt only proves the caller has *a* JWT (the public anon key
// is one too), so the user is checked with auth.getUser() below.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LABELS: Record<string, string> = {
  upload: "uploaded a document",
  signed: "signed a document on screen",
  returned: "returned a signed document",
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email || !user.email_confirmed_at) return json(401, { ok: false, error: "not signed in" });

  let body: { kind?: string; title?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  const action = LABELS[body.kind ?? ""];
  if (!action) return json(400, { ok: false });

  const name = (user.user_metadata?.full_name as string | undefined) || user.email;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [INTERNAL_EMAIL],
      reply_to: user.email,
      subject: `Client ${action}: ${String(body.title ?? "").slice(0, 80)} (${name})`,
      html: `<p><b>${esc(name)}</b> (${esc(user.email)}) ${esc(action)}.</p>
        <p>${esc(String(body.title ?? "").slice(0, 200))}${body.category ? ` &middot; ${esc(String(body.category).slice(0, 40))}` : ""}</p>
        <p style="color:#888;font-size:12px">Supabase &rarr; Storage &rarr; <b>client-uploads</b> &rarr; folder <b>${esc(user.email.toLowerCase())}</b>.
        On-screen signatures are in the <b>document_signatures</b> table.</p>`,
    }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  return json(200, { ok: res.ok });
});
