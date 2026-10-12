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
    .functions.invoke("notify-client", { body: { email: clientEmail, kind: "message", title: "" } })
    .catch(() => undefined);
  return null;
}
