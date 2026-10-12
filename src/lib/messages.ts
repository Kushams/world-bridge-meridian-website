import { getSupabaseClient } from "@/lib/supabase/client";

/** One line in a client's thread (supabase/messages.sql). */
export interface ThreadMessage {
  id: string;
  client_email: string;
  sender: "client" | "staff" | "system";
  author_email: string | null;
  author_name: string | null;
  kind: string;
  body: string;
  link: string | null;
  audio_path: string | null;
  created_at: string;
}

export interface Handler {
  name: string;
  title: string;
  email: string;
  avatar_url: string | null;
}

const db = () => getSupabaseClient()!;

export async function loadThread(clientEmail: string): Promise<ThreadMessage[] | null> {
  const { data, error } = await db()
    .from("client_messages")
    .select("*")
    .eq("client_email", clientEmail.toLowerCase())
    .order("created_at", { ascending: true })
    .limit(500);
  return error ? null : (data as ThreadMessage[]);
}

export async function loadHandler(): Promise<Handler | null> {
  const { data } = await db().rpc("my_handler");
  return ((data as Handler[] | null) ?? [])[0] ?? null;
}

/** Client side: post in your own thread, then email the team. */
export async function postAsClient(body: string): Promise<string | null> {
  const { error } = await db().rpc("post_message", { p_body: body });
  if (error) return error.message;
  db()
    .functions.invoke("notify-client-activity", { body: { kind: "message", title: body } })
    .catch(() => undefined);
  return null;
}

/** Staff side: reply in a client's thread, then email the client. */
export async function postAsStaff(clientEmail: string, body: string): Promise<string | null> {
  const { error } = await db().rpc("staff_post_message", { p_client_email: clientEmail, p_body: body });
  if (error) return error.message;
  db()
    .functions.invoke("notify-client", { body: { email: clientEmail, kind: "message", title: body } })
    .catch(() => undefined);
  return null;
}

const VOICE_BUCKET = "chat-voice";

/** "audio/webm;codecs=opus" -> ["audio/webm", "webm"] */
function audioType(blob: Blob): [string, string] {
  const mime = (blob.type || "audio/webm").split(";")[0];
  const ext = ({ "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4", "audio/mpeg": "mp3", "audio/aac": "aac", "audio/x-m4a": "m4a" } as Record<string, string>)[mime];
  return [mime, ext ?? "webm"];
}

/** Records into the thread's private folder, posts the message, then emails the other side. */
export async function postVoice(
  clientEmail: string,
  viewer: "client" | "staff",
  blob: Blob,
  seconds: number,
): Promise<string | null> {
  const client = clientEmail.toLowerCase();
  const [mime, ext] = audioType(blob);
  const path = `${client}/${Date.now()}.${ext}`;
  const { error: up } = await db().storage.from(VOICE_BUCKET).upload(path, blob, { contentType: mime });
  if (up) return up.message;
  const { error } = await db().rpc("post_voice", { p_client_email: client, p_path: path, p_seconds: Math.round(seconds) });
  if (error) return error.message;
  const note = "Voice note — open your messages to listen";
  db()
    .functions.invoke(
      viewer === "client" ? "notify-client-activity" : "notify-client",
      { body: viewer === "client" ? { kind: "message", title: note } : { email: client, kind: "message", title: note } },
    )
    .catch(() => undefined);
  return null;
}

export async function voiceUrl(path: string): Promise<string | null> {
  const { data } = await db().storage.from(VOICE_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** How many messages from our team this client has not seen yet (sent after `since`). */
export async function countStaffMessagesSince(clientEmail: string, since: string): Promise<number> {
  const { count } = await db()
    .from("client_messages")
    .select("id", { count: "exact", head: true })
    .eq("client_email", clientEmail.toLowerCase())
    .eq("sender", "staff")
    .eq("kind", "message")
    .gt("created_at", since);
  return count ?? 0;
}
