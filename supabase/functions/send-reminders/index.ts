import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { FONT, layout, requestNoun, requestTopic, staffSignature, type Signature } from "../_shared/email.ts";

// Called hourly by pg_cron (supabase/reminders.sql) with the shared secret.
//  * "We haven't heard from you": when the latest thing in a client's thread
//    came from us and the client hasn't answered for 3 days, then 7 days.
//    Never after their request is confirmed or closed.
//  * Admin digest, at most once a day: clients with a request older than
//    24 hours and nobody looking after them.
// Every reminder is recorded in public.reminder_log so it only sends once.
// Clients flagged in public.client_flags (reminders off, or blocked) are skipped.
// Body {email} sends one reminder now (called by staff-client-action).
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";
const ACCOUNT_URL = "https://worldbridgemeridian.com/my-world-bridge";
const STAFF_URL = "https://worldbridgemeridian.com/staff";
const DAY = 24 * 60 * 60 * 1000;
const NUDGES = [
  { n: 1, after: 3 * DAY },
  { n: 2, after: 7 * DAY },
];
const LOOKBACK = 30 * DAY;
// Thread rows that mean "we did something and are waiting on the client".
const OURS = new Set(["document", "sign", "return", "invoice", "invoice_pdf", "status"]);
const LABELS: Record<string, string> = {
  "journey-request": "journey request",
  "travel-details": "exhibition travel request",
  contact: "enquiry",
};

type Msg = { id: string; client_email: string; sender: string; kind: string; body: string; created_at: string };
type Req = { email: string; name: string | null; subject: string | null; form_type: string; status: string; submitted_at: string; payload: Record<string, unknown> | null };

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function send(to: string[], subject: string, html: string, bcc: string[] = [], signature?: Signature, replyTo: string[] = [INTERNAL_EMAIL]) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to, bcc: bcc.length ? bcc : undefined, reply_to: replyTo, subject, html: layout(html, signature) }),
  });
  if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  return res.ok;
}

/** Claims a reminder key; false if it was already sent. */
async function claim(key: string): Promise<boolean> {
  const { error } = await db.from("reminder_log").insert({ key });
  if (!error) return true;
  if (error.code !== "23505") console.error("reminder_log", error.message);
  return false;
}

async function release(key: string) {
  await db.from("reminder_log").delete().eq("key", key);
}

/** n = 0 for a reminder sent by hand from the staff page, 1/2 for the automatic ones. */
async function nudge(
  email: string,
  m: Msg | undefined,
  request: Req | undefined,
  n: number,
  staff: { email: string; name: string | null; role: string }[],
  handler: Map<string, string>,
  team: string[],
) {
  const coordinatorEmail = handler.get(email);
  const coordinator = staff.find((s) => s.email === coordinatorEmail)?.name ?? "your travel coordinator";
  const first = (request?.name ?? "").trim().split(/\s+/)[0];
  const about = request ? requestTopic(request) : "";
  const what = request ? `Your ${requestNoun(request)}${about ? ` for ${about}` : ""} is still open` : "Your account has something waiting for you";
  const preview = m ? (m.body.length > 280 ? `${m.body.slice(0, 280)}…` : m.body) : "";
  return await send(
    [email],
    `${n === 0 ? "Checking in" : n === 1 ? "We haven't heard from you" : "Still here when you're ready"}${about ? `: ${about}` : ""} — World Bridge Meridian`,
    `<div style="color:#1c1c1c;max-width:560px">
      <p>${first ? `Dear ${esc(first)},` : "Hello,"}</p>
      <p>${n === 0 ? "We wanted to check in with you." : "We haven't heard from you in a little while, so we wanted to check in."} ${esc(what)}, and ${esc(coordinator)} is waiting for your reply.</p>
      ${preview ? `<p style="color:#666">The latest from us:</p>
      <blockquote style="margin:0;padding:12px 16px;border-left:3px solid #b8964e;background:#f7f4ee;white-space:pre-wrap">${esc(preview)}</blockquote>` : ""}
      ${button(`${ACCOUNT_URL}#messages`, "Reply now")}
      <p>If your plans have changed, or you'd like to talk it through, just reply to this email.</p>
      <p>Warm regards,</p>
    </div>`,
    [...new Set([...team, ...(coordinatorEmail ? [coordinatorEmail] : [])])],
    staffSignature(staff.find((s) => s.email === coordinatorEmail)),
    coordinatorEmail ? [coordinatorEmail, INTERNAL_EMAIL] : [INTERNAL_EMAIL],
  );
}

function button(href: string, label: string) {
  return `<p style="margin:28px 0"><a href="${href}" style="background:#1c1c1c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:${FONT};font-size:13px;letter-spacing:.05em;text-transform:uppercase">${esc(label)}</a></p>`;
}

Deno.serve(async (req: Request) => {
  if (!NOTIFY_SHARED_SECRET || req.headers.get("x-wbm-notify-secret") !== NOTIFY_SHARED_SECRET) {
    return new Response(JSON.stringify({ ok: false, error: "forbidden" }), { status: 403 });
  }
  const now = Date.now();
  const since = new Date(now - LOOKBACK).toISOString();

  let manual = "";
  try {
    manual = String(((await req.json()) as { email?: string }).email ?? "").trim().toLowerCase();
  } catch {
    // Scheduled runs send an empty body.
  }

  const [staffRes, assignRes, msgRes, reqRes, flagRes] = await Promise.all([
    db.from("staff_members").select("email, name, role"),
    db.from("client_assignments").select("client_email, staff_email"),
    db.from("client_messages").select("id, client_email, sender, kind, body, created_at").gte("created_at", since).order("created_at", { ascending: false }),
    db.from("form_submissions").select("email, name, subject, form_type, status, submitted_at, payload").neq("form_type", "newsletter").gte("submitted_at", since).order("submitted_at", { ascending: false }),
    db.from("client_flags").select("client_email, reminders_off, blocked"),
  ]);
  for (const r of [staffRes, assignRes, msgRes, reqRes, flagRes]) {
    if (r.error) return new Response(JSON.stringify({ ok: false, error: r.error.message }), { status: 500 });
  }
  const staff = staffRes.data as { email: string; name: string | null; role: string }[];
  const staffEmails = new Set(staff.map((s) => s.email));
  const admins = staff.filter((s) => s.role === "admin").map((s) => s.email);
  const team = [...new Set([INTERNAL_EMAIL, ...admins])];
  const handler = new Map((assignRes.data as { client_email: string; staff_email: string }[]).map((a) => [a.client_email, a.staff_email]));

  const latestReq = new Map<string, Req>();
  for (const r of reqRes.data as Req[]) {
    const email = r.email.toLowerCase();
    if (!latestReq.has(email)) latestReq.set(email, r);
  }

  const quiet = new Set(
    (flagRes.data as { client_email: string; reminders_off: boolean; blocked: boolean }[])
      .filter((f) => f.reminders_off || f.blocked)
      .map((f) => f.client_email),
  );

  if (manual) {
    const m = (msgRes.data as Msg[]).find((x) => x.client_email === manual && x.sender !== "client" && (x.sender === "staff" || OURS.has(x.kind)));
    const ok = await nudge(manual, m, latestReq.get(manual), 0, staff, handler, team);
    return new Response(JSON.stringify({ ok }), { headers: { "Content-Type": "application/json" } });
  }

  // 1. Clients who haven't replied.
  let nudged = 0;
  const latestMsg = new Map<string, Msg>();
  for (const m of msgRes.data as Msg[]) if (!latestMsg.has(m.client_email)) latestMsg.set(m.client_email, m);
  for (const [email, m] of latestMsg) {
    if (staffEmails.has(email) || quiet.has(email)) continue;
    const waitingOnClient = m.sender === "staff" || (m.sender === "system" && OURS.has(m.kind));
    if (!waitingOnClient) continue;
    const request = latestReq.get(email);
    if (request && (request.status === "confirmed" || request.status === "closed")) continue;
    const age = now - new Date(m.created_at).getTime();
    const due = [...NUDGES].reverse().find((s) => age >= s.after);
    if (!due) continue;
    if (due.n === 2) {
      const { data } = await db.from("reminder_log").select("key").eq("key", `noreply:${m.id}:1`).maybeSingle();
      if (!data) continue;
    }
    const key = `noreply:${m.id}:${due.n}`;
    if (!(await claim(key))) continue;

    const ok = await nudge(email, m, request, due.n, staff, handler, team);
    if (ok) nudged++;
    else await release(key);
  }

  // 2. Admin digest of unassigned clients.
  const unassigned = [...latestReq.entries()].filter(
    ([email, r]) => !staffEmails.has(email) && !quiet.has(email) && !handler.has(email) && now - new Date(r.submitted_at).getTime() >= DAY && r.status !== "closed",
  );
  let digest = false;
  if (unassigned.length) {
    const key = `unassigned:${new Date(now).toISOString().slice(0, 10)}`;
    if (await claim(key)) {
      const rows = unassigned
        .map(([email, r]) => `<tr>
          <td style="padding:6px 12px 6px 0">${esc(r.name || email)}<br><span style="color:#888">${esc(email)}</span></td>
          <td style="padding:6px 12px 6px 0">${esc(requestTopic(r) || r.subject || LABELS[r.form_type] || r.form_type)}</td>
          <td style="padding:6px 12px 6px 0">${esc(Math.floor((now - new Date(r.submitted_at).getTime()) / DAY))} days</td>
          <td style="padding:6px 0"><a href="${STAFF_URL}?client=${encodeURIComponent(email)}#clients">Open this client</a></td>
        </tr>`)
        .join("");
      digest = await send(
        team,
        `${unassigned.length} client${unassigned.length === 1 ? "" : "s"} still waiting for a coordinator`,
        `<p>These clients sent a request more than 24 hours ago and nobody is looking after them yet. Open each one and choose a coordinator under "Looked after by".</p>
        <table style="font-size:14px;line-height:1.5;border-collapse:collapse">${rows}</table>`,
      );
      if (!digest) await release(key);
    }
  }

  return new Response(JSON.stringify({ ok: true, nudged, digest }), { headers: { "Content-Type": "application/json" } });
});
