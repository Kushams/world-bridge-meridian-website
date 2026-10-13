"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { loadEmblem, loadPdfFonts } from "@/lib/invoicePdf";
import { buildOrderReceiptPdf, type OrderReceipt } from "@/lib/orderReceiptPdf";

interface Order {
  id: string;
  reference: string;
  kind: "gift-card" | "travel-credits";
  description: string;
  amount_usd: number;
  paid_at: string | null;
  created_at: string;
  paid_via: string | null;
  order_details: Record<string, string> | null;
}

const usd = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Receipts for the Travel Credits and gift cards this client has bought, each as a downloadable gift-card style PDF. */
export function PurchaseReceipts() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    let alive = true;
    supabase
      .from("invoices")
      .select("id, reference, kind, description, amount_usd, paid_at, created_at, paid_via, order_details")
      .in("kind", ["gift-card", "travel-credits"])
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .then(({ data }) => alive && setOrders(((data ?? []) as Order[]).map((o) => ({ ...o, amount_usd: Number(o.amount_usd) }))));
    return () => {
      alive = false;
    };
  }, [user]);

  async function download(o: Order) {
    setError("");
    setBusy(o.id);
    try {
      const d = o.order_details ?? {};
      const qty = Math.max(1, Number(d.quantity) || 1);
      const data: OrderReceipt = {
        reference: o.reference,
        kind: o.kind,
        total: o.amount_usd,
        paidAt: o.paid_at,
        createdAt: o.created_at,
        paidVia: o.paid_via,
        quantity: qty,
        each: o.kind === "gift-card" ? Number(d.amount) || o.amount_usd / qty : o.amount_usd,
        design: d.design === "seasonal" ? "seasonal" : "classic",
        recipientName: d.recipient_name ?? "",
        recipientEmail: d.recipient_email ?? "",
        message: d.gift_message ?? "",
      };
      const blob = await buildOrderReceiptPdf(data, { name: profile?.full_name ?? null, email: user?.email ?? "" }, await loadEmblem(), await loadPdfFonts());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${o.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError("We couldn't make your receipt just now. Please try again in a moment.");
    }
    setBusy(null);
  }

  if (!orders.length) return null;
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory">Purchase receipts</p>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border hairline bg-charcoal">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center gap-3 p-3.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ivory">{o.description}</span>
              <span className="block text-xs text-stone-dim">
                {o.reference} · {fmt(o.paid_at ?? o.created_at)} · {usd(o.amount_usd)}
              </span>
            </span>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => download(o)}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory hover:border-gold disabled:opacity-40"
            >
              {busy === o.id ? "Preparing…" : "Receipt"}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
