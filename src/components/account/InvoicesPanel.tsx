"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { loadInvoices, startCardPayment, type Invoice } from "@/lib/invoices";
import { CardCheckoutTips } from "@/components/payments/PayMethodPicker";

const usd = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Invoices your consultant has sent, with a "Pay by card" button for each unpaid one. */
export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<Invoice[] | null | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    loadInvoices().then((list) => alive && setInvoices(list));
    return () => {
      alive = false;
    };
  }, []);

  async function pay(invoice: Invoice) {
    setError("");
    setBusy(invoice.id);
    const { url, error: err } = await startCardPayment(invoice.id, token);
    setToken(null);
    setResetKey((k) => k + 1);
    if (err || !url) {
      setBusy(null);
      setError(err ?? "Something went wrong.");
      return;
    }
    window.location.assign(url);
  }

  if (invoices === undefined) return <p className="text-sm text-stone-dim">Loading your invoices…</p>;
  if (invoices === null) return <p className="text-sm text-stone">We couldn&apos;t load your invoices just now. Please try again in a moment.</p>;
  if (invoices.length === 0) {
    return (
      <p className="max-w-xl text-sm text-stone leading-relaxed">
        No invoices yet. When your consultant sends you one, it will appear here and you can pay it by card, bank transfer or crypto.
      </p>
    );
  }

  const hasUnpaid = invoices.some((i) => i.status === "unpaid");
  return (
    <div className="max-w-2xl space-y-4">
      {invoices.map((i) => (
        <div key={i.id} className="rounded-card border hairline p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg text-ivory">{i.description}</p>
              <p className="mt-1 text-xs text-stone-dim">
                {i.reference} · sent {fmt(i.created_at)}
              </p>
            </div>
            <p className="font-display text-xl text-ivory">{usd(i.amount_usd)}</p>
          </div>
          {i.status === "paid" ? (
            <p className="mt-3 text-sm text-gold">Paid{i.paid_at ? ` on ${fmt(i.paid_at)}` : ""} — thank you.</p>
          ) : i.status === "needs_review" ? (
            <p className="mt-3 text-sm text-stone">We&apos;re checking your payment and will confirm it in writing shortly.</p>
          ) : i.status === "void" ? (
            <p className="mt-3 text-sm text-stone-dim">Cancelled.</p>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button type="button" size="md" disabled={busy !== null} onClick={() => pay(i)}>
                {busy === i.id ? "Opening secure payment…" : "Pay by card"}
              </Button>
              <a href="/payments#bank-transfer" className="text-xs text-stone underline underline-offset-4 hover:text-ivory">
                Or pay by bank transfer or crypto
              </a>
            </div>
          )}
        </div>
      ))}
      {hasUnpaid ? (
        <>
          <div className="mt-2">
            <TurnstileWidget onToken={setToken} resetKey={resetKey} />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <CardCheckoutTips />
        </>
      ) : null}
    </div>
  );
}
