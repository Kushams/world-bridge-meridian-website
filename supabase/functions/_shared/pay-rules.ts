// The rules the card-payment webhook uses to decide what a message from ePayVista means.
// Kept free of imports and of any database or network calls, so tests/payment-webhook.test.mjs can run them directly.

const enc = new TextEncoder();

export async function hmacHex(secret: string, raw: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, raw));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Is this message really from ePayVista? The signature header must match the HMAC of the exact bytes received. */
export async function signatureValid(secret: string, raw: Uint8Array, header: string | null): Promise<boolean> {
  const given = (header ?? "").toLowerCase();
  return safeEqual(given, await hmacHex(secret, raw));
}

export type EpvMessage = { reference_id?: string; status?: string; txid?: string; amount_in_usd?: string };

/** Only a "CLOSED" message with a reference means an order finished; anything else is acknowledged and ignored. */
export function isOrderClosed(msg: EpvMessage): msg is EpvMessage & { reference_id: string } {
  return Boolean(msg.reference_id) && msg.status === "CLOSED";
}

/** The dollar amount the checkout was opened for: the session's own amount if we have one, else the invoice's. */
export function amountAsked(session: { amount_usd: number } | null, invoice: { amount_usd: number }): number {
  return session ? Number(session.amount_usd) : Number(invoice.amount_usd);
}

/** A different transaction arriving on an invoice that is already paid is a double payment; the same one again is just a retry. */
export function isDoublePayment(paidTxid: string | null | undefined, txid: string | undefined): boolean {
  return Boolean(txid) && Boolean(paidTxid) && txid !== paidTxid;
}

/** After asking ePayVista for the order: "paid" only if it is filled for exactly the amount we asked, otherwise a person must check. */
export function judgePayment(order: { paymentState?: string; amountInUSD?: string }, asked: number): "paid" | "needs_review" {
  const sameAmount = Number(order.amountInUSD) === Number(asked);
  return order.paymentState === "FILLED" && sameAmount ? "paid" : "needs_review";
}

/** Gift cards and Travel Credits are fulfilled automatically once paid; plain invoices are not. */
export function needsFulfilment(status: string, kind: string, clientEmail: string | undefined): boolean {
  return status === "paid" && kind !== "invoice" && Boolean(clientEmail);
}
