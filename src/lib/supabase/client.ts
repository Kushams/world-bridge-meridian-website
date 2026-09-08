import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Accounts + saved-trips sync are entirely optional — the site works fine
 * without a Supabase project. Everything that touches this checks this
 * flag first, so an unconfigured deploy just behaves like there's no
 * accounts feature (falls back to browser-only localStorage).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Only ever constructed in the browser — auth relies on browser storage. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  if (!client) {
    client = createClient(url!, anonKey!);
  }
  return client;
}
