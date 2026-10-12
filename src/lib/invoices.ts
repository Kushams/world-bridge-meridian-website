import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { LineItem } from "@/lib/money";

export interface Invoice {
  id: string;
  reference: string;
  description: string;
  amount_usd: number;
  status: "unpaid" | "paid" | "needs_review" | "void";
  paid_at: string | null;
  created_at: string;
  /** Pasted in by staff when the client chooses a bank transfer; empty until then. */
  bank_details: string | null;
  /** The invoice's own currency and total. amount_usd is what card / crypto charges. Older invoices have no amount (USD). */
  currency: string;
  amount: number | null;
  subtotal: number | null;
  tax_percent: number;
  line_items: LineItem[] | null;
  due_date: string | null;
}

export async function loadInvoices(): Promise<Invoice[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("invoices")
    .select("id, reference, description, amount_usd, status, paid_at, created_at, bank_details, currency, amount, subtotal, tax_percent, line_items, due_date")
    .eq("kind", "invoice")
    .order("created_at", { ascending: false });
  if (error) return null;
  return (data ?? []).map((i) => ({ ...i, amount_usd: Number(i.amount_usd), amount: i.amount == null ? null : Number(i.amount), subtotal: i.subtotal == null ? null : Number(i.subtotal), tax_percent: Number(i.tax_percent ?? 0) })) as Invoice[];
}

export type CardOrder =
  | { kind: "travel-credits"; amount: number; name: string }
  | {
      kind: "gift-card";
      amount: number;
      quantity: number;
      name: string;
      design: string;
      sendAsGift: boolean;
      recipientName: string;
      recipientEmail: string;
      message: string;
    };

/** Asks the server for the card checkout link for one invoice (checks Turnstile and ownership there). */
export function startCardPayment(invoiceId: string, token: string | null) {
  return openCheckout("invoice-card-pay", { invoiceId }, token);
}

/** Starts a card checkout for Travel Credits or gift cards; the server re-checks the amount and fulfils the order once paid. */
export function startOrderCardPayment(order: CardOrder, token: string | null) {
  return openCheckout("order-card-pay", { ...order, acceptedTerms: true }, token);
}

async function openCheckout(fn: string, body: Record<string, unknown>, token: string | null): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { url: null, error: "Card payments aren't available right now." };
  if (!token) return { url: null, error: "Please wait for the security check to finish, then try again." };
  const { data, error } = await supabase.functions.invoke(fn, { body: { ...body, token } });
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

export interface BankLine {
  label: string;
  value: string;
}

/** Splits saved bank details into rows: "Label: value" lines become a label and a value, anything else is a value only. */
export function parseBankLines(text: string): BankLine[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(line);
      return m ? { label: m[1].trim(), value: m[2].trim() } : { label: "", value: line };
    });
}

/** The reverse: rows back into the text saved on the invoice. Empty values are dropped; a colon can't live in a label. */
export function serializeBankLines(lines: BankLine[]): string {
  return lines
    .map((l) => ({ label: l.label.replace(/[:：\r\n]+/g, " ").trim().slice(0, 40), value: l.value.replace(/[\r\n]+/g, " ").trim() }))
    .filter((l) => l.value)
    .map((l) => (l.label ? `${l.label}: ${l.value}` : l.value))
    .join("\n");
}
