import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface RedeemRow {
  ok: boolean;
  message: string;
}

/**
 * Redeems a gift card or voucher code. With the security check on, it goes through the
 * submit-form function, which verifies the Turnstile token first.
 */
export async function redeemGiftCard(code: string, turnstileToken: string | null): Promise<{ row: RedeemRow | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { row: null, error: "Redeeming isn't available right now." };

  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    if (!turnstileToken) return { row: null, error: "Please wait for the security check to finish, then try again." };
    const { data, error } = await supabase.functions.invoke("submit-form", {
      body: { action: "redeem-gift-card", token: turnstileToken, payload: { code } },
    });
    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const body: { error?: string } = await error.context.json();
          if (body.error) return { row: null, error: body.error };
        } catch {
          // fall through
        }
      }
      return { row: null, error: "We couldn't check that code just now. Please try again." };
    }
    return { row: (data?.result as RedeemRow | undefined) ?? null, error: null };
  }

  const { data, error } = await supabase.rpc("redeem_gift_card", { p_code: code });
  if (error) return { row: null, error: "We couldn't check that code just now. Please try again." };
  return { row: (Array.isArray(data) ? data[0] : data) ?? null, error: null };
}
