import type { Invoice } from "@/lib/invoices";
import { totals } from "@/lib/money";
import { buildInvoicePdf, loadEmblem, loadPdfFonts } from "@/lib/invoicePdf";

/**
 * Builds the stamped, branded receipt for a paid invoice in the browser and saves it. Works for every payment method
 * (card, crypto, bank transfer), because it is made from the invoice itself, not stored by whoever marked it paid.
 */
export async function downloadReceipt(inv: Invoice, client: { name: string | null; email: string; phone: string | null }): Promise<boolean> {
  try {
    const lines = inv.line_items?.length
      ? inv.line_items
      : [{ title: inv.description, details: "", qty: 1, unit_price: inv.amount ?? inv.amount_usd, amount: inv.amount ?? inv.amount_usd }];
    const t = totals(lines, inv.tax_percent ?? 0);
    const blob = await buildInvoicePdf(
      {
        reference: inv.reference,
        createdAt: inv.created_at,
        dueDate: inv.due_date,
        status: "paid",
        paidAt: inv.paid_at ?? new Date().toISOString(),
        currency: inv.currency ?? "USD",
        lines,
        subtotal: inv.subtotal ?? t.subtotal,
        taxPercent: inv.tax_percent ?? 0,
        total: inv.amount ?? t.total,
        amountUsd: inv.amount_usd,
        fxRate: 1,
      },
      client,
      await loadEmblem(),
      await loadPdfFonts(),
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt-${inv.reference}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch {
    return false;
  }
}
