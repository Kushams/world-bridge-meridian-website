import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Staff page → Team → Price book: permanently delete an item. Any staff member (is_staff, checked with the caller's own JWT).
// Invoices already created keep their own copy of every line, so deleting an item never changes an old invoice.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false });

  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const [{ data: who }, { data: isStaff }] = await Promise.all([asCaller.auth.getUser(), asCaller.rpc("is_staff")]);
  if (!who.user?.email || !who.user.email_confirmed_at) return json(401, { ok: false, error: "not signed in" });
  if (isStaff !== true) return json(403, { ok: false, error: "Staff only" });

  let body: { action?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  if (body.action !== "delete" || !body.id || !UUID.test(body.id)) return json(400, { ok: false });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { error } = await db.from("price_book").delete().eq("id", body.id);
  if (error) return json(500, { ok: false, error: "could not delete" });
  return json(200, { ok: true });
});
