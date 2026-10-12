import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { pushToTeam, type PushPayload } from "../_shared/push.ts";

// Called by database triggers (supabase/push-triggers.sql) when something happens that staff should hear about at once:
// a client message or upload, a new request, a payment, or a crypto payment reference. Sends a real push notification to
// every admin and to the staff member looking after that client. Same protection as the other notify functions:
// a Vault-held key in the Authorization header plus the shared secret header.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");

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

  if (!payload) return json(200, { ok: true, skipped: true });
  const result = await pushToTeam(db, who, payload);
  return json(200, { ok: true, sent: result.sent });
});
