import { getSupabaseClient } from "@/lib/supabase/client";

export type Status = "received" | "in_review" | "proposal_sent" | "confirmed" | "closed";

export const STATUSES: { key: Status; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "in_review", label: "In review" },
  { key: "proposal_sent", label: "Proposal sent" },
  { key: "confirmed", label: "Confirmed" },
  { key: "closed", label: "Closed" },
];

export const FORM_LABEL: Record<string, string> = {
  contact: "Message",
  "journey-request": "Journey request",
  "travel-details": "Exhibition travel form",
  "gift-card": "Gift card order",
  "travel-credits": "Travel Credits purchase",
  newsletter: "Newsletter",
};

export interface Request {
  id: string;
  form_type: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  submitted_at: string;
  status: Status;
  status_updated_at: string;
}

export interface Client {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  confirmed: boolean;
  /** Staff member who looks after this client; null = unassigned (admins only). */
  assigned_to: string | null;
}

export interface StaffMember {
  email: string;
  role: "admin" | "staff";
  name: string | null;
  link_code: string | null;
}

export interface TeamMember extends StaffMember {
  clients: number;
}

export const SITE_URL = "https://worldbridgemeridian.com";
export const personalLink = (code: string) => `${SITE_URL}/?from=${code}`;
export const staffName = (m: StaffMember) => m.name || m.email;

export interface Signature {
  document_path: string;
  document_title: string | null;
  signer_name: string;
  signed_at: string;
}

export interface StaffInvoice {
  id: string;
  reference: string;
  description: string;
  amount_usd: number;
  status: "unpaid" | "paid" | "needs_review" | "void";
  created_at: string;
  paid_at: string | null;
  user_id: string;
}

export interface StoredFile {
  name: string;
  path: string;
  added: string | null;
  size: number | null;
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

export const usd = (n: number) =>
  `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const db = () => getSupabaseClient()!;

/** The signed-in staff member, or null if they aren't on the staff list. */
export async function loadMe(): Promise<StaffMember | null> {
  const { data, error } = await db().rpc("staff_me");
  return error ? null : ((data as StaffMember[] | null)?.[0] ?? null);
}

export async function loadTeam(): Promise<TeamMember[]> {
  const { data } = await db().rpc("staff_team");
  return ((data as TeamMember[] | null) ?? []).map((m) => ({ ...m, clients: Number(m.clients) }));
}

export async function assignClient(clientEmail: string, staffEmail: string | null): Promise<string | null> {
  const { error } = await db().rpc("staff_assign", { p_client_email: clientEmail, p_staff_email: staffEmail });
  return error ? error.message : null;
}

export async function loadRequests(): Promise<Request[] | null> {
  const { data, error } = await db()
    .from("form_submissions")
    .select("id, form_type, name, email, subject, message, payload, submitted_at, status, status_updated_at")
    .neq("form_type", "newsletter")
    .order("submitted_at", { ascending: false })
    .limit(500);
  return error ? null : (data as Request[]);
}

export async function setStatus(id: string, status: Status): Promise<string | null> {
  const { error } = await db().rpc("staff_set_status", { p_id: id, p_status: status });
  return error ? error.message : null;
}

export async function loadClients(): Promise<Client[] | null> {
  const { data, error } = await db().rpc("staff_list_clients");
  return error ? null : (data as Client[]);
}

export async function loadClientRequests(email: string): Promise<Request[]> {
  const { data } = await db()
    .from("form_submissions")
    .select("id, form_type, name, email, subject, message, payload, submitted_at, status, status_updated_at")
    .ilike("email", email)
    .neq("form_type", "newsletter")
    .order("submitted_at", { ascending: false });
  return (data as Request[]) ?? [];
}

export async function loadProfile(id: string): Promise<Record<string, unknown> | null> {
  const { data } = await db().from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Record<string, unknown> | null) ?? null;
}

export async function loadSignatures(email: string): Promise<Signature[]> {
  const { data } = await db()
    .from("document_signatures")
    .select("document_path, document_title, signer_name, signed_at")
    .like("document_path", `${email}/%`)
    .order("signed_at", { ascending: false });
  return (data as Signature[]) ?? [];
}

export async function loadClientInvoices(userId: string): Promise<StaffInvoice[] | null> {
  const { data, error } = await db()
    .from("invoices")
    .select("id, reference, description, amount_usd, status, created_at, paid_at, user_id")
    .eq("kind", "invoice")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return error ? null : (data ?? []).map((i) => ({ ...i, amount_usd: Number(i.amount_usd) })) as StaffInvoice[];
}

export async function createInvoice(email: string, amount: number, description: string) {
  const { data, error } = await db().rpc("staff_create_invoice", {
    p_email: email,
    p_amount: amount,
    p_description: description,
  });
  return { reference: (data as string | null) ?? null, error: error?.message ?? null };
}

export async function voidInvoice(id: string): Promise<string | null> {
  const { error } = await db().rpc("staff_void_invoice", { p_id: id });
  return error ? error.message : null;
}

/** Files directly inside `prefix` (sub-folders skipped). */
export async function listFiles(bucket: string, prefix: string): Promise<StoredFile[]> {
  const { data } = await db().storage.from(bucket).list(prefix, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  return (data ?? [])
    .filter((f) => f.id && !f.name.startsWith("."))
    .map((f) => ({
      name: f.name,
      path: `${prefix}/${f.name}`,
      added: f.created_at ?? null,
      size: (f.metadata as { size?: number } | null)?.size ?? null,
    }));
}

export async function openFile(bucket: string, path: string): Promise<boolean> {
  const { data } = await db().storage.from(bucket).createSignedUrl(path, 3600);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  return Boolean(data?.signedUrl);
}

export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { error } = await db().storage.from(bucket).upload(path, file, { contentType: file.type || undefined });
  return error ? error.message : null;
}

export async function removeFile(bucket: string, path: string): Promise<string | null> {
  const { error } = await db().storage.from(bucket).remove([path]);
  return error ? error.message : null;
}

export type ClientNotice = "document" | "sign" | "return" | "invoice" | "invoice_pdf";

/** Emails the client that something new is in their account. Best effort: the upload already succeeded. */
export async function notifyClient(email: string, kind: ClientNotice, title: string): Promise<boolean> {
  try {
    const { data, error } = await db().functions.invoke("notify-client", { body: { email, kind, title } });
    return !error && (data as { ok?: boolean } | null)?.ok === true;
  } catch {
    return false;
  }
}
