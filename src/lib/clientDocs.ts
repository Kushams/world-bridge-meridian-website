import { getSupabaseClient } from "@/lib/supabase/client";

/** Staff-to-client files whose names start with these ask the client to act. */
export const SIGN_PREFIX = "SIGN - ";
export const RETURN_PREFIX = "RETURN - ";

export type DocKind = "view" | "sign" | "return";

export function docKind(fileName: string): DocKind {
  if (fileName.startsWith(SIGN_PREFIX)) return "sign";
  if (fileName.startsWith(RETURN_PREFIX)) return "return";
  return "view";
}

/** "SIGN - Booking terms_v2.pdf" -> "Booking terms v2" */
export function docTitle(fileName: string): string {
  return fileName
    .replace(/^(SIGN|RETURN) - /, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Safe object-name piece: keeps letters, digits, dot, dash, underscore. */
export function safeName(name: string): string {
  return name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(-80);
}

export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Tell the team something arrived. Best effort: the upload or signature is
 * already saved, so a failed email must never show the client an error.
 */
export async function notifyTeam(kind: "upload" | "signed" | "returned", title: string, category?: string) {
  try {
    await getSupabaseClient()?.functions.invoke("notify-client-activity", { body: { kind, title, category } });
  } catch {
    /* ignore */
  }
}
