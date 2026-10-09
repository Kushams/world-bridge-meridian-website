import { FunctionsHttpError } from "@supabase/supabase-js";
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
  /** Cloudflare Turnstile token; required whenever the security check is switched on. */
  turnstileToken?: string | null;
}

export type SubmissionFailure = "duplicate" | "throttled" | "unavailable" | "verification";

/**
 * Records a payment reference for manual staff verification. This never
 * marks a payment as confirmed — status always starts at
 * "pending_verification" (see supabase/schema.sql). Only works when
 * Supabase is configured; the UI must not be shown otherwise.
 */
export async function submitCryptoPayment(
  input: CryptoPaymentSubmissionInput,
): Promise<{ ok: true } | { ok: false; kind: SubmissionFailure; error: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      kind: "unavailable",
      error: "Payment submission isn't available right now.",
    };
  }

  // With the security check on, the only way in is the submit-form function, which verifies
  // the Turnstile token before saving (see supabase/lock-payment-tables.sql).
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    if (!input.turnstileToken) {
      return { ok: false, kind: "verification", error: "Please wait for the security check to finish, then try again." };
    }
    const { error } = await supabase.functions.invoke("submit-form", {
      body: {
        action: "crypto-payment",
        token: input.turnstileToken,
        payload: {
          asset: input.asset,
          network: input.network,
          walletAddress: input.walletAddress,
          transactionHash: input.transactionHash,
          payerName: input.payerName,
          payerEmail: input.payerEmail,
          leadId: input.leadId,
          notes: input.notes,
        },
      },
    });
    if (!error) return { ok: true };
    const status = error instanceof FunctionsHttpError ? error.context.status : 0;
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const body: { error?: string } = await error.context.json();
        if (body.error) message = body.error;
      } catch {
        // keep generic message
      }
    }
    if (status === 409) return { ok: false, kind: "duplicate", error: message };
    if (status === 429) return { ok: false, kind: "throttled", error: message };
    if (status === 403) return { ok: false, kind: "verification", error: message };
    return { ok: false, kind: "unavailable", error: message };
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
    // Both come from supabase/hardening.sql: 23505 is the one-row-per-hash
    // index, 53400 the submission rate limits.
    if (error.code === "23505") {
      return {
        ok: false,
        kind: "duplicate",
        error: "We've already received this transaction reference.",
      };
    }
    if (error.code === "53400") {
      return { ok: false, kind: "throttled", error: error.message };
    }
    return { ok: false, kind: "unavailable", error: error.message };
  }
  return { ok: true };
}
