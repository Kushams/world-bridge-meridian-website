import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

// Called by the website after a signed-in client uploads a document, signs one
// on screen, or returns a signed file. Emails the team, attaching the uploaded
// file when `path` is given (only files inside the caller's own client-uploads
// folder). verify_jwt only proves the caller has *a* JWT (the public anon key
// is one too), so the user is checked with auth.getUser() below.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAFF_URL = "https://worldbridgemeridian.com/staff";
const MAX_ATTACH = 15 * 1024 * 1024;
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
  message: "sent a message",
};

// The line shown in the client's Messages thread (supabase/messages.sql).
const THREAD: Record<string, string> = {
  upload: "Uploaded",
  signed: "Signed on screen",
  returned: "Signed copy returned",
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

  let body: { kind?: string; title?: string; category?: string; path?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  const action = LABELS[body.kind ?? ""];
  if (!action) return json(400, { ok: false });

  const name = (user.user_metadata?.full_name as string | undefined) || user.email;
  const folder = user.email.toLowerCase();
  const path = typeof body.path === "string" ? body.path : "";
  const kind = body.kind as string;
  if (THREAD[kind]) {
    const what = String(body.title ?? "").slice(0, 160);
    const { error } = await supabase.rpc("log_client_event", {
      p_client_email: folder,
      p_kind: kind,
      p_body: `${THREAD[kind]}${body.category ? ` (${String(body.category).slice(0, 40)})` : ""}${what ? `: ${what}` : ""}`,
      p_link: "#documents",
    });
    if (error) console.error("thread log failed", error.message);
  }
  let attachments: { filename: string; content: string }[] | undefined;
  let fileNote = "";
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  // The staff member looking after this client (supabase/staff.sql) gets a copy.
  const { data: assigned } = await admin.from("client_assignments").select("staff_email").eq("client_email", folder).maybeSingle();
  const recipients = [INTERNAL_EMAIL, ...(assigned?.staff_email && assigned.staff_email !== INTERNAL_EMAIL ? [assigned.staff_email] : [])];
  if (path && path.startsWith(`${folder}/`) && !path.includes("..")) {
    const { data: blob } = await admin.storage.from("client-uploads").download(path);
    if (blob && blob.size <= MAX_ATTACH) {
      attachments = [{ filename: path.split("/").pop()!.replace(/^\d{10,}-/, ""), content: encodeBase64(new Uint8Array(await blob.arrayBuffer())) }];
      fileNote = "The file is attached to this email.";
    } else if (blob) {
      const { data: signed } = await admin.storage.from("client-uploads").createSignedUrl(path, 7 * 24 * 3600);
      if (signed?.signedUrl) fileNote = `The file is too large to attach. <a href="${esc(signed.signedUrl)}">Download it</a> (link works for 7 days).`;
    }
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: recipients,
      reply_to: user.email,
      subject: kind === "message" ? `New message from ${name}` : `Client ${action}: ${String(body.title ?? "").slice(0, 80)} (${name})`,
      html: `<p><b>${esc(name)}</b> (${esc(user.email)}) ${esc(action)}.</p>
        <p>${esc(String(body.title ?? "").slice(0, kind === "message" ? 2000 : 200))}${body.category ? ` &middot; ${esc(String(body.category).slice(0, 40))}` : ""}</p>
        ${fileNote ? `<p>${fileNote}</p>` : ""}
        <p><a href="${STAFF_URL}?client=${encodeURIComponent(folder)}#clients" style="display:inline-block;background:#1c1917;color:#f5f0e6;padding:10px 18px;border-radius:999px;text-decoration:none">${kind === "message" ? "Read and reply" : "Open this client"}</a></p>
        <p style="color:#78716c;font-size:13px">Opens ${esc(name)}'s page on the staff site (sign in if asked).</p>`,
      ...(attachments ? { attachments } : {}),
    }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  return json(200, { ok: res.ok });
});
