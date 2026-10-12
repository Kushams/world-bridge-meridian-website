import webpush from "npm:web-push@3.6.7";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Real push notifications to staff phones and computers (Web Push).
// The VAPID key pair lives in public.push_config (service role only) and is created the first time it is needed.
const SUBJECT = "mailto:info@worldbridgemeridian.group";

export interface PushPayload {
  title: string;
  body: string;
  /** Where tapping the notification goes, e.g. /staff?client=a@b.com#clients */
  url: string;
  tag?: string;
}

export async function vapidKeys(db: SupabaseClient): Promise<{ publicKey: string; privateKey: string }> {
  const read = () => db.from("push_config").select("public_key, private_key").eq("id", 1).maybeSingle();
  const first = await read();
  if (first.data) return { publicKey: first.data.public_key, privateKey: first.data.private_key };
  const keys = webpush.generateVAPIDKeys();
  await db.from("push_config").upsert({ id: 1, public_key: keys.publicKey, private_key: keys.privateKey }, { onConflict: "id", ignoreDuplicates: true });
  const again = await read();
  if (!again.data) throw new Error("could not create push keys");
  return { publicKey: again.data.public_key, privateKey: again.data.private_key };
}

/** Sends one notification to every registered device of the given staff emails. Never throws: a failed push must not break the caller. */
export async function sendPush(db: SupabaseClient, emails: string[], payload: PushPayload): Promise<{ sent: number; removed: number }> {
  try {
    const to = [...new Set(emails.map((e) => e.toLowerCase()))];
    if (!to.length) return { sent: 0, removed: 0 };
    const { data: subs } = await db.from("push_subscriptions").select("endpoint, p256dh, auth").in("email", to);
    if (!subs?.length) return { sent: 0, removed: 0 };
    const keys = await vapidKeys(db);
    webpush.setVapidDetails(SUBJECT, keys.publicKey, keys.privateKey);
    const body = JSON.stringify({ ...payload, title: payload.title.slice(0, 80), body: payload.body.slice(0, 180) });
    let sent = 0;
    const dead: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body, { TTL: 3600, urgency: "high" });
          sent++;
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) dead.push(s.endpoint);
          else console.error("push failed", code, String(err).slice(0, 200));
        }
      }),
    );
    if (dead.length) await db.from("push_subscriptions").delete().in("endpoint", dead);
    return { sent, removed: dead.length };
  } catch (err) {
    console.error("push error", String(err).slice(0, 200));
    return { sent: 0, removed: 0 };
  }
}

/** Everyone who should hear about something for this client: every admin plus the staff member looking after them. */
export async function teamEmails(db: SupabaseClient, clientEmail?: string | null): Promise<string[]> {
  const out = new Set<string>();
  const { data: admins } = await db.from("staff_members").select("email").eq("role", "admin");
  for (const a of admins ?? []) out.add(a.email);
  if (clientEmail) {
    const { data: assigned } = await db.from("client_assignments").select("staff_email").eq("client_email", clientEmail.toLowerCase()).maybeSingle();
    if (assigned?.staff_email) out.add(assigned.staff_email);
  }
  return [...out];
}

export async function pushToTeam(db: SupabaseClient, clientEmail: string | null, payload: PushPayload) {
  return sendPush(db, await teamEmails(db, clientEmail), payload);
}
