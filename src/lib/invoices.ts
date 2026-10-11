import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface Invoice {
  id: string;
  reference: string;
  description: string;
  amount_usd: number;
  status: "unpaid" | "paid" | "needs_review" | "void";
  paid_at: string | null;
  created_at: string;
}

export async function loadInvoices(): Promise<Invoice[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("invoices")
    .select("id, reference, description, amount_usd, status, paid_at, created_at")
    .order("created_at", { ascending: false });
  if (error) return null;
  return (data ?? []).map((i) => ({ ...i, amount_usd: Number(i.amount_usd) })) as Invoice[];
}

/** Asks the server for the card checkout link for one invoice (checks Turnstile and ownership there). */
export async function startCardPayment(invoiceId: string, token: string | null): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { url: null, error: "Card payments aren't available right now." };
  if (!token) return { url: null, error: "Please wait for the security check to finish, then try again." };
  const { data, error } = await supabase.functions.invoke("invoice-card-pay", { body: { invoiceId, token } });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const body: { error?: string } = await error.context.json();
        if (body.error) return { url: null, error: body.error };
      } catch {
        // fall through
      }
    }
    return { url: null, error: "We couldn't start the card payment just now. Please try again." };
  }
  const url = (data as { url?: string } | null)?.url;
  return url ? { url, error: null } : { url: null, error: "We couldn't start the card payment just now. Please try again." };
}
