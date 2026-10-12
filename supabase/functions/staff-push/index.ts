import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendPush, vapidKeys } from "../_shared/push.ts";

// Staff page → turn push notifications on or off for this device.
//   key         → the site's public Web Push key (created on first use)
//   subscribe   → save this device's subscription for the signed-in staff member
//   unsubscribe → forget this device
//   test        → send a test notification to the caller's own devices
// Only staff (is_staff, checked with the caller's own JWT) may use it.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false });

  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const [{ data: who }, { data: isStaff }] = await Promise.all([asCaller.auth.getUser(), asCaller.rpc("is_staff")]);
  const email = who.user?.email?.toLowerCase();
  if (!email || !who.user?.email_confirmed_at) return json(401, { ok: false, error: "not signed in" });
  if (isStaff !== true) return json(403, { ok: false, error: "staff only" });

  let body: { action?: string; subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }; endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }

  if (body.action === "key") {
    try {
      return json(200, { ok: true, publicKey: (await vapidKeys(db)).publicKey });
    } catch (err) {
      console.error(err);
      return json(500, { ok: false, error: "could not prepare notifications" });
    }
  }

  if (body.action === "subscribe") {
    const s = body.subscription;
    if (!s?.endpoint || !s.keys?.p256dh || !s.keys.auth || !s.endpoint.startsWith("https://")) return json(400, { ok: false, error: "bad subscription" });
    const { error } = await db.from("push_subscriptions").upsert(
      { endpoint: s.endpoint, email, p256dh: s.keys.p256dh, auth: s.keys.auth, user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200) },
      { onConflict: "endpoint" },
    );
    if (error) return json(500, { ok: false, error: "could not save" });
    return json(200, { ok: true });
  }

  if (body.action === "unsubscribe") {
    if (body.endpoint) await db.from("push_subscriptions").delete().eq("endpoint", body.endpoint).eq("email", email);
    return json(200, { ok: true });
  }

  if (body.action === "test") {
    const r = await sendPush(db, [email], { title: "Notifications are on", body: "You'll be alerted here when clients message you, send requests or pay.", url: "/staff#today", tag: "test" });
    return json(200, { ok: true, sent: r.sent });
  }

  return json(400, { ok: false });
});
