import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Staff page → one client's account controls.
//   remind / stop_reminders / resume_reminders / block / unblock: any staff
//   member who can see the client (admins: everyone; staff: their own clients).
//   delete: admins only. Removes the auth user plus their messages, requests,
//   invoices, assignment, flags and private files.
// Who may act is checked with the caller's own JWT (is_staff, staff_list_clients,
// is_admin); the changes themselves use the service role.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTIFY_SHARED_SECRET = Deno.env.get("NOTIFY_SHARED_SECRET");
const BUCKETS = ["client-documents", "client-uploads", "chat-voice"];
const FOREVER = "876000h";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "remind" | "stop_reminders" | "resume_reminders" | "block" | "unblock" | "delete";
const ACTIONS: Action[] = ["remind", "stop_reminders", "resume_reminders", "block", "unblock", "delete"];

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

/** Every object under `prefix/` in a bucket, including subfolders. */
async function listAll(bucket: string, prefix: string): Promise<string[]> {
  const out: string[] = [];
  const { data } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`;
    if (item.id) out.push(path);
    else out.push(...(await listAll(bucket, path)));
  }
  return out;
}

async function setFlags(email: string, by: string, patch: { reminders_off?: boolean; blocked?: boolean }) {
  const { error } = await admin
    .from("client_flags")
    .upsert({ client_email: email, updated_by: by, updated_at: new Date().toISOString(), ...patch }, { onConflict: "client_email" });
  return error?.message ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false });

  const asCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const [{ data: who }, { data: isStaff }] = await Promise.all([asCaller.auth.getUser(), asCaller.rpc("is_staff")]);
  const by = who.user?.email?.toLowerCase();
  if (!by || isStaff !== true) return json(403, { ok: false, error: "Staff only" });

  let body: { email?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false });
  }
  const action = body.action as Action;
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!ACTIONS.includes(action) || !email) return json(400, { ok: false, error: "Bad request" });

  const { data: clients } = await asCaller.rpc("staff_list_clients");
  const client = (clients as { id: string; email: string }[] | null)?.find((c) => c.email === email);
  if (!client) return json(404, { ok: false, error: "Not one of your clients" });

  const { data: flags } = await admin.from("client_flags").select("blocked").eq("client_email", email).maybeSingle();

  switch (action) {
    case "remind": {
      if (flags?.blocked) return json(409, { ok: false, error: "This account is blocked" });
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-reminders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "x-wbm-notify-secret": NOTIFY_SHARED_SECRET ?? "",
        },
        body: JSON.stringify({ email }),
      });
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean };
      return out.ok ? json(200, { ok: true }) : json(502, { ok: false, error: "The email didn't send" });
    }
    case "stop_reminders":
    case "resume_reminders": {
      const error = await setFlags(email, by, { reminders_off: action === "stop_reminders" });
      return error ? json(500, { ok: false, error }) : json(200, { ok: true });
    }
    case "block":
    case "unblock": {
      const { error: banError } = await admin.auth.admin.updateUserById(client.id, {
        ban_duration: action === "block" ? FOREVER : "none",
      });
      if (banError) return json(500, { ok: false, error: banError.message });
      const error = await setFlags(email, by, { blocked: action === "block" });
      return error ? json(500, { ok: false, error }) : json(200, { ok: true });
    }
    case "delete": {
      const { data: isAdmin } = await asCaller.rpc("is_admin");
      if (isAdmin !== true) return json(403, { ok: false, error: "Only admins can delete accounts" });
      for (const bucket of BUCKETS) {
        const paths = await listAll(bucket, email);
        if (paths.length) await admin.storage.from(bucket).remove(paths);
      }
      const avatars = await listAll("avatars", client.id);
      if (avatars.length) await admin.storage.from("avatars").remove(avatars);
      for (const [table, column, value] of [
        ["client_messages", "client_email", email],
        ["client_assignments", "client_email", email],
        ["client_flags", "client_email", email],
        ["invoices", "user_id", client.id],
      ] as const) {
        const { error } = await admin.from(table).delete().eq(column, value);
        if (error) return json(500, { ok: false, error: `${table}: ${error.message}` });
      }
      const { error: formsError } = await admin
        .from("form_submissions")
        .delete()
        .ilike("email", email.replace(/[\\%_]/g, (c) => `\\${c}`));
      if (formsError) return json(500, { ok: false, error: `form_submissions: ${formsError.message}` });
      const { error } = await admin.auth.admin.deleteUser(client.id);
      return error ? json(500, { ok: false, error: error.message }) : json(200, { ok: true });
    }
  }
});
