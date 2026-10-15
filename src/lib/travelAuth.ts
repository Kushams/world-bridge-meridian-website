import { getSupabaseClient } from "@/lib/supabase/client";
import type { Destination, TravelAuthValues } from "./travelAuthData";

/** One Travel Authorisation Form sent to a client (table travel_auth_requests, supabase/travel-auth-requests.sql). */
export interface TravelAuthRequest {
  id: string;
  client_email: string;
  created_by: string;
  created_at: string;
  exhibition: string;
  destination_kind: Destination;
  destination: string;
  covered_by: string;
  purpose: string;
  signer_name: string;
  signer_title: string;
  signer_signature: string | null;
  prefill: Partial<TravelAuthValues>;
  status: "pending" | "signed" | "void";
  signed_values: Partial<TravelAuthValues> | null;
  signed_at: string | null;
  document_path: string | null;
}

const db = () => getSupabaseClient()!;
export const TRAVEL_AUTH_TITLE = "Travel authorisation form";

/** Forms waiting for the signed-in client to fill in and sign. */
export async function loadPendingTravelAuth(): Promise<TravelAuthRequest[]> {
  const { data, error } = await db().from("travel_auth_requests").select("*").eq("status", "pending").order("created_at", { ascending: false });
  return error ? [] : ((data as TravelAuthRequest[]) ?? []);
}

/** Every form sent to one client, newest first (staff view). */
export async function loadTravelAuthFor(email: string): Promise<TravelAuthRequest[]> {
  const { data, error } = await db().from("travel_auth_requests").select("*").ilike("client_email", email).order("created_at", { ascending: false });
  return error ? [] : ((data as TravelAuthRequest[]) ?? []);
}

export async function createTravelAuth(args: {
  email: string;
  exhibition: string;
  kind: Destination;
  destination: string;
  coveredBy: string;
  purpose: string;
  prefill: TravelAuthValues;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await db().rpc("staff_create_travel_auth", {
    p_email: args.email,
    p_exhibition: args.exhibition,
    p_kind: args.kind,
    p_destination: args.destination,
    p_covered_by: args.coveredBy,
    p_purpose: args.purpose,
    p_prefill: args.prefill,
  });
  return error ? { id: null, error: error.message } : { id: data as string, error: null };
}

export async function voidTravelAuth(id: string): Promise<string | null> {
  const { error } = await db().rpc("staff_void_travel_auth", { p_id: id });
  return error ? error.message : null;
}

/** Who signs every form for World Bridge Meridian (the founder), with the signature image (PNG data URL). */
export interface CompanySigner {
  name: string;
  title: string;
  signature: string;
}

export async function loadCompanySigner(): Promise<CompanySigner | null> {
  const { data, error } = await db().rpc("company_signer");
  return error ? null : ((data as CompanySigner[] | null)?.[0] ?? null);
}

/** Admins only. */
export async function saveCompanySigner(signer: CompanySigner): Promise<string | null> {
  const { error } = await db().rpc("admin_set_company_signature", { p_name: signer.name, p_title: signer.title, p_signature: signer.signature });
  return error ? error.message : null;
}

export async function signTravelAuth(args: {
  id: string;
  values: TravelAuthValues;
  documentPath: string;
  sha256: string | null;
  signerName: string;
  drawn: string | null;
}): Promise<string | null> {
  const { error } = await db().rpc("sign_travel_auth", {
    p_id: args.id,
    p_values: args.values,
    p_document_path: args.documentPath,
    p_sha256: args.sha256,
    p_signer_name: args.signerName,
    p_drawn: args.drawn,
    p_user_agent: typeof navigator === "undefined" ? "" : navigator.userAgent.slice(0, 300),
  });
  return error ? error.message : null;
}
