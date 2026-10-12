import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { FONT, layout, staffSignature } from "../_shared/email.ts";

// Called by the staff page after staff send a client something. Emails the
// client a short "something new is in your account" note. Only staff
// (public.is_staff(), checked with the caller's own JWT) can trigger it.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAFF_URL = "https://worldbridgemeridian.com/staff";
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const REPLY_TO = "info@worldbridgemeridian.group";
const ACCOUNT_URL = "https://worldbridgemeridian.com/my-world-bridge";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MESSAGES: Record<string, { subject: string; line: string; button: string; hash: string }> = {
  document: { subject: "A new document is in your account", line: "We've added a new document for you", button: "View document", hash: "#documents" },
  sign: { subject: "A document is ready for your signature", line: "We've sent you a document to review and sign on screen", button: "Review & sign", hash: "#documents" },
  return: { subject: "A form needs your signature", line: "We've sent you a form to download, sign and send back to us", button: "Open the form", hash: "#documents" },
  invoice: { subject: "You have a new invoice", line: "We've sent you a new invoice, which you can pay by card from your account", button: "View invoice", hash: "#invoices" },
  invoice_pdf: { subject: "Your detailed invoice is ready", line: "The detailed PDF for your invoice is now in your account", button: "View invoice", hash: "#invoices" },
  message: { subject: "You have a new message", line: "Your travel coordinator has sent you a message", button: "Read and reply", hash: "#messages" },
};

// The line shown in the client's Messages thread (supabase/messages.sql).
const THREAD: Record<string, string> = {
  document: "We sent you a document",
  sign: "A document is ready for your signature",
  return: "A form to download, sign and send back",
  invoice: "New invoice",
  invoice_pdf: "Detailed invoice PDF added",
};

const esc = (v: unknown) =>
  String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Every staff reply is copied to the admins (info@ and the founder) for oversight.
async function copyToAdmins(caller: ReturnType<typeof createClient>, client: string, clientName: string | null, text: string) {
  const { data: who } = await caller.auth.getUser();
  const sender = who.user?.email?.toLowerCase() ?? "";
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: staff } = await admin.from("staff_members").select("email, name, role");
  const rows = (staff ?? []) as { email: string; name: string | null; role: string }[];
  const to = [...new Set([REPLY_TO, ...rows.filter((r) => r.role === "admin").map((r) => r.email)])].filter((e) => e !== sender);
  if (!to.length) return;
  const from = rows.find((r) => r.email === sender)?.name || sender;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      reply_to: sender || REPLY_TO,
      subject: `${from} → ${clientName || client}: new message`,
      html: layout(`<p><b>${esc(from)}</b> sent a message to <b>${esc(clientName || client)}</b> (${esc(client)}):</p>
        <blockquote style="margin:0;padding:12px 16px;border-left:3px solid #b8964e;background:#f7f4ee;white-space:pre-wrap">${esc(text)}</blockquote>
        <p><a href="${STAFF_URL}?client=${encodeURIComponent(client)}#clients">Open this client on the staff page</a></p>`),
    }),
  });
  if (!res.ok) console.error("admin copy failed", res.status, await res.text());
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: isStaff } = await supabase.rpc("is_staff");
  if (isStaff !== true) return json(403, { ok: false, error: "staff only" });

  let body: { email?: string; kind?: string; title?: string; amount?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  const msg = MESSAGES[body.kind ?? ""];
  const to = String(body.email ?? "").trim().toLowerCase();
  if (!msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json(400, { ok: false });

  const { data: clients } = await supabase.rpc("staff_list_clients");
  const client = (clients as { email: string; full_name: string | null }[] | null)?.find((c) => c.email === to);
  if (!client) return json(404, { ok: false, error: "no account" });

  const first = (client.full_name ?? "").trim().split(/\s+/)[0];
  const { data: who } = await supabase.auth.getUser();
  const { data: senderRow } = await createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    .from("staff_members")
    .select("email, name, role")
    .eq("email", who.user?.email?.toLowerCase() ?? "")
    .maybeSingle();
  const kind = body.kind as string;
  const title = String(body.title ?? "").slice(0, kind === "message" ? 2000 : 160);
  if (THREAD[kind]) {
    const { error } = await supabase.rpc("log_client_event", {
      p_client_email: to,
      p_kind: kind,
      p_body: title ? `${THREAD[kind]}: ${title}` : THREAD[kind],
      p_link: msg.hash,
    });
    if (error) console.error("thread log failed", error.message);
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      reply_to: senderRow ? [senderRow.email, REPLY_TO] : REPLY_TO,
      subject: msg.subject,
      html: layout(`<div style="color:#1c1c1c;max-width:560px">
        <p>${first ? `Dear ${esc(first)},` : "Hello,"}</p>
        ${kind === "message"
          ? `<p>${esc(msg.line)}${title ? ":" : "."}</p>${title ? `<blockquote style="margin:0;padding:12px 16px;border-left:3px solid #b8964e;background:#f7f4ee;white-space:pre-wrap">${esc(title)}</blockquote>` : ""}`
          : `<p>${esc(msg.line)}${title ? `: <b>${esc(title)}</b>` : ""}.</p>`}
        <p style="margin:28px 0"><a href="${ACCOUNT_URL}${msg.hash}" style="background:#1c1c1c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:${FONT};font-size:13px;letter-spacing:.05em;text-transform:uppercase">${esc(msg.button)}</a></p>
        <p>Sign in with this email address to see it. If you have any questions, just reply to this email.</p>
        <p>Warm regards,</p>
      </div>`, staffSignature(senderRow ?? undefined)),
    }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  if (kind === "message") await copyToAdmins(supabase, to, client.full_name, title);
  return json(200, { ok: res.ok });
});
