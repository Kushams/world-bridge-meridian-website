import { getSupabaseClient } from "@/lib/supabase/client";

export type CryptoPaymentStatus =
  | "awaiting_payment"
  | "payment_submitted"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "expired";

export interface CryptoPaymentSubmissionInput {
  asset: string;
  network: string;
  walletAddress: string;
  transactionHash: string;
  payerName?: string;
  payerEmail?: string;
  leadId?: string;
  notes?: string;
}

/**
 * Records a payment reference for manual staff verification. This never
 * marks a payment as confirmed — status always starts at
 * "pending_verification" (see supabase/schema.sql). Only works when
 * Supabase is configured; the UI must not be shown otherwise.
 */
export async function submitCryptoPayment(
  input: CryptoPaymentSubmissionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Payment submission isn't available right now." };
  }

  const { error } = await supabase.from("crypto_payment_submissions").insert({
    asset: input.asset,
    network: input.network,
    wallet_address: input.walletAddress,
    transaction_hash: input.transactionHash,
    payer_name: input.payerName || null,
    payer_email: input.payerEmail || null,
    lead_id: input.leadId || null,
    notes: input.notes || null,
    status: "pending_verification" satisfies CryptoPaymentStatus,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
