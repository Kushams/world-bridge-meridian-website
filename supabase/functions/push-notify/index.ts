import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { layout } from "../_shared/email.ts";
import { pushToTeam, teamEmails, type PushPayload } from "../_shared/push.ts";

// Called by database triggers (supabase/push-triggers.sql) when something happens that staff should hear about at once:
// a client message or upload, a new request, a payment, a crypto payment reference, a new account, a saved journey,
// Travel Credits spent or a gift card redeemed. Sends a real push notification to every admin and to the staff member
// looking after that client. The last four have no email of their own elsewhere, so this function also emails the team
// for them (messages, requests and payments already have their own emails). Same protection as the other notify functions:
// a Vault-held key in the Authorization header plus the shared secret header.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "World Bridge Meridian <enquiries@worldbridgemeridian.group>";
const INTERNAL_EMAIL = "info@worldbridgemeridian.group";
const STAFF_URL = "https://worldbridgemeridian.com/staff";

type Row = Record<string, unknown>;
const text = (v: unknown, max = 160) => String(v ?? "").trim().slice(0, max);
const clientUrl = (email: string) => `/staff?client=${encodeURIComponent(email.toLowerCase())}#clients`;
const usd = (n: unknown) => `US$${Number(n ?? 0).toFixed(2)}`;
const LABEL: Record<string, string> = {
  contact: "message",
  "journey-request": "journey request",
  "travel-details": "exhibition travel request",
  "gift-card": "gift card order",
  "travel-credits": "Travel Credits purchase",
};

const esc = (v: unknown) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { ok: false });
  if (!NOTIFY_SHARED_SECRET || req.headers.get("x-wbm-notify-secret") !== NOTIFY_SHARED_SECRET) return json(403, { ok: false, error: "forbidden" });

  let body: { table?: string; op?: string; record?: Row };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  const r = body.record ?? {};
  let who: string | null = null;
  let payload: PushPayload | null = null;

  if (body.table === "client_messages") {
    who = text(r.client_email).toLowerCase();
    const kind = text(r.kind);
    const name = text(r.author_name) || who;
    const preview = kind === "voice" ? "Sent a voice note" : text(r.body);
    if (r.sender === "client" && (kind === "message" || kind === "voice")) {
      payload = { title: `New message from ${name}`, body: preview, url: clientUrl(who), tag: `msg-${who}` };
    } else if (["upload", "signed", "returned"].includes(kind)) {
      payload = { title: `${name} sent you something`, body: preview, url: clientUrl(who), tag: `activity-${who}` };
    }
  } else if (body.table === "form_submissions") {
    const type = text(r.form_type);
    const payloadObj = (r.payload ?? {}) as Row;
    if (type !== "newsletter" && payloadObj.payment_method !== "card") {
      who = text(r.email).toLowerCase();
      const label = type === "journey-request" && payloadObj.requestType ? `${text(payloadObj.requestType)} request` : LABEL[type] ?? "request";
      payload = {
        title: `New ${label}${r.name ? ` from ${text(r.name, 60)}` : ""}`,
        body: text(payloadObj.exhibition_or_event) || text(r.subject) || "Open the staff page to see it",
        url: clientUrl(who),
        tag: `request-${who}`,
      };
    }
  } else if (body.table === "invoices") {
    const { data } = await db.auth.admin.getUserById(text(r.user_id));
    who = data.user?.email?.toLowerCase() ?? null;
    if (r.status === "paid") {
      payload = { title: `Payment received: ${usd(r.amount_usd)}`, body: `${text(r.reference)} · ${who ?? ""}`, url: who ? clientUrl(who) : "/staff#today", tag: `paid-${text(r.reference)}` };
    } else if (r.status === "needs_review") {
      payload = { title: "A payment needs checking", body: `${text(r.reference)} · ${who ?? ""}`, url: who ? clientUrl(who) : "/staff#today", tag: `check-${text(r.reference)}` };
    }
  } else if (body.table === "crypto_payment_submissions") {
    who = text(r.payer_email).toLowerCase() || null;
    payload = {
      title: "Crypto payment submitted: needs verifying",
      body: `${text(r.asset, 20)} (${text(r.network, 30)}) from ${text(r.payer_name, 60) || who || "a client"}`,
      url: who ? clientUrl(who) : "/staff#today",
      tag: `crypto-${text(r.id, 40)}`,
    };
  }

  // Events that have no email of their own yet: we send the email too.
  let emailAlso = false;
  const userInfo = async (id: unknown) => {
    const { data } = await db.auth.admin.getUserById(text(id));
    const email = data.user?.email?.toLowerCase() ?? null;
    const name = (data.user?.user_metadata?.full_name as string | undefined) || email || "A client";
    return { email, name: text(name, 60) };
  };
  if (body.table === "profiles") {
    const u = await userInfo(r.id);
    who = u.email;
    emailAlso = true;
    payload = { title: "New client signed up", body: u.name + (u.email && u.name !== u.email ? ` · ${u.email}` : ""), url: who ? clientUrl(who) : "/staff#clients", tag: `signup-${text(r.id, 40)}` };
  } else if (body.table === "saved_journeys") {
    const u = await userInfo(r.user_id);
    who = u.email;
    emailAlso = true;
    payload = { title: `${u.name} saved a journey`, body: text(r.title) || text(r.href), url: who ? clientUrl(who) : "/staff#clients", tag: `saved-${text(r.user_id, 40)}` };
  } else if (body.table === "travel_credit_ledger") {
    const { data: bucket } = await db.from("travel_credit_buckets").select("user_id").eq("id", text(r.bucket_id)).maybeSingle();
    const u = await userInfo(bucket?.user_id);
    who = u.email;
    emailAlso = true;
    payload = { title: `${u.name} used Travel Credits`, body: `${usd(Math.abs(Number(r.delta_cents ?? 0)) / 100)}${r.note ? ` · ${text(r.note, 80)}` : ""}`, url: who ? clientUrl(who) : "/staff#clients", tag: `credits-${text(r.id, 40)}` };
  } else if (body.table === "gift_cards") {
    const u = await userInfo(r.owner_user_id);
    who = u.email;
    emailAlso = true;
    payload = { title: `${u.name} redeemed a gift card`, body: usd(Number(r.amount_cents ?? 0) / 100), url: who ? clientUrl(who) : "/staff#clients", tag: `gift-${text(r.id, 40)}` };
  }

  if (!payload) return json(200, { ok: true, skipped: true });
  const result = await pushToTeam(db, who, payload);

  if (emailAlso && RESEND_API_KEY) {
    const to = new Set([INTERNAL_EMAIL, ...(await teamEmails(db, who))]);
    const link = who ? `${STAFF_URL}?client=${encodeURIComponent(who)}#clients` : `${STAFF_URL}#clients`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [...to],
        subject: payload.title,
        html: layout(`<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a8813f">Client activity</p>
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.35">${esc(payload.title)}</h2>
          <p>${esc(payload.body)}</p>
          ${who ? `<p style="color:#55504a">${esc(who)}</p>` : ""}
          <p style="margin:24px 0"><a href="${link}" style="background:#1c1c1c;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:13px;letter-spacing:.05em;text-transform:uppercase">Open this client</a></p>`),
      }),
    });
    if (!res.ok) console.error("Resend send failed", res.status, await res.text());
  }
  return json(200, { ok: true, sent: result.sent });
});
