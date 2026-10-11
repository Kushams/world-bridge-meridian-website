"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { loadInvoices, startCardPayment, type Invoice } from "@/lib/invoices";
import { CardCheckoutTips } from "@/components/payments/PayMethodPicker";

const BUCKET = "client-documents";
const usd = (n: number) => `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS: Record<Invoice["status"], { label: string; className: string }> = {
  unpaid: { label: "Due", className: "border-gold/60 bg-gold/10 text-gold" },
  paid: { label: "Paid", className: "border-emerald-600/40 bg-emerald-600/10 text-emerald-700" },
  needs_review: { label: "Checking payment", className: "border-line bg-transparent text-stone" },
  void: { label: "Cancelled", className: "border-line bg-transparent text-stone-dim" },
};

/** Detailed invoice PDFs staff upload to `<client email>/invoices/` in client-documents, named starting with the reference. */
function useInvoicePdfs(folder: string | null) {
  const [pdfs, setPdfs] = useState<string[]>([]);
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !folder) return;
    let alive = true;
    supabase.storage
      .from(BUCKET)
      .list(`${folder}/invoices`, { limit: 200 })
      .then(({ data }) => alive && setPdfs((data ?? []).filter((f) => f.id && f.name.toLowerCase().endsWith(".pdf")).map((f) => f.name)));
    return () => {
      alive = false;
    };
  }, [folder]);
  return pdfs;
}

/** Small paper-style preview of an invoice. */
function InvoiceSheet({ invoice }: { invoice: Invoice }) {
  return (
    <div
      aria-hidden
      className="relative hidden w-40 shrink-0 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5 sm:block"
      style={{ aspectRatio: "1 / 1.3" }}
    >
      <div className="h-2" style={{ background: "linear-gradient(90deg,#0f1c33,#8a5a22)" }} />
      <div className="space-y-2 p-3 text-[7px] leading-tight text-neutral-500">
        <p className="text-[8px] font-semibold uppercase tracking-widest text-neutral-800">World Bridge Meridian</p>
        <p className="font-mono">{invoice.reference}</p>
        <div className="space-y-1 pt-1">
          {[90, 75, 82, 60].map((w) => (
            <div key={w} className="h-1 rounded bg-neutral-200" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-[8px] font-semibold text-neutral-800">
          <span>Total</span>
          <span>{usd(invoice.amount_usd)}</span>
        </div>
      </div>
      {invoice.status === "paid" ? (
        <span className="absolute bottom-4 right-[-28px] rotate-[-30deg] border-2 border-emerald-600/70 px-6 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700/80">
          Paid
        </span>
      ) : null}
    </div>
  );
}

/** Invoices your consultant has sent: a visual card each, the detailed PDF when uploaded, and "Pay by card" for unpaid ones. */
export function InvoicesPanel() {
  const { user } = useAuth();
  const pdfs = useInvoicePdfs(user?.email?.toLowerCase() ?? null);
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

  async function openPdf(name: string) {
    const supabase = getSupabaseClient();
    const folder = user?.email?.toLowerCase();
    if (!supabase || !folder) return;
    setBusy(name);
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(`${folder}/invoices/${name}`, 3600);
    setBusy(null);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
    else setError("We couldn't open that invoice just now. Please try again.");
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

  const due = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.amount_usd, 0);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount_usd, 0);
  const hasUnpaid = due > 0;

  return (
    <div className="max-w-3xl space-y-5">
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Amount due", usd(due), "text-gold"],
          ["Paid", usd(paid), "text-ivory"],
          ["Invoices", String(invoices.length), "text-ivory"],
        ].map(([k, v, c]) => (
          <div key={k} className="rounded-card border hairline p-4">
            <dt className="text-xs uppercase tracking-wide text-stone">{k}</dt>
            <dd className={`mt-1 font-display text-lg md:text-2xl ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {invoices.map((i) => {
        const pdf = pdfs.find((n) => n.toLowerCase().startsWith(i.reference.toLowerCase()));
        const s = STATUS[i.status];
        return (
          <article key={i.id} className="flex gap-5 rounded-card border hairline p-5">
            <InvoiceSheet invoice={i} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.className}`}>
                    {s.label}
                  </span>
                  <h3 className="mt-2 font-display text-lg text-ivory md:text-xl">{i.description}</h3>
                  <p className="mt-1 text-xs text-stone-dim">
                    {i.reference} · issued {fmt(i.created_at)}
                    {i.status === "paid" && i.paid_at ? ` · paid ${fmt(i.paid_at)}` : ""}
                  </p>
                </div>
                <p className="font-display text-2xl text-ivory">{usd(i.amount_usd)}</p>
              </div>

              {i.status === "needs_review" ? (
                <p className="mt-3 text-sm text-stone">We&apos;re checking your payment and will confirm it in writing shortly.</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {i.status === "unpaid" ? (
                  <Button type="button" size="md" disabled={busy !== null} onClick={() => pay(i)}>
                    {busy === i.id ? "Opening secure payment…" : "Pay by card"}
                  </Button>
                ) : null}
                {pdf ? (
                  <Button type="button" size="md" variant="outline" disabled={busy !== null} onClick={() => openPdf(pdf)}>
                    {busy === pdf ? "Opening…" : "View invoice (PDF)"}
                  </Button>
                ) : (
                  <span className="text-xs text-stone-dim">Detailed invoice PDF coming soon from your consultant.</span>
                )}
                {i.status === "unpaid" ? (
                  <a href="/payments#bank-transfer" className="text-xs text-stone underline underline-offset-4 hover:text-ivory">
                    Or pay by bank transfer or crypto
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}

      {hasUnpaid ? (
        <>
          <div className="mt-2">
            <TurnstileWidget onToken={setToken} resetKey={resetKey} />
          </div>
          <CardCheckoutTips />
        </>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
