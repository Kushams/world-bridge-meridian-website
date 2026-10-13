"use client";

import { useEffect, useState } from "react";
import { fmtDate, loadMoneyRows, usd, type Client, type MoneyRow } from "@/lib/staff";

const sum = (rows: MoneyRow[]) => rows.reduce((n, r) => n + r.amount_usd, 0);

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "gold" | "red" }) {
  return (
    <div className="rounded-2xl border hairline bg-charcoal/40 p-4">
      <p className="text-[11px] uppercase tracking-wider text-stone-dim">{label}</p>
      <p className={`mt-1 font-display text-2xl ${tone === "red" ? "text-red-500" : tone === "gold" ? "text-gold" : "text-ivory"}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-stone-dim">{sub}</p> : null}
    </div>
  );
}

const METHOD: Record<string, string> = { card: "Card", "bank transfer": "Bank transfer", crypto: "Crypto" };

/** Admins: how much has come in, what is still owed and what is overdue. All amounts in US dollars (what card and crypto charge). */
export function MoneyPanel({ clients }: { clients: Client[] }) {
  const [rows, setRows] = useState<MoneyRow[] | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadMoneyRows().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);

  if (rows === undefined) return <p className="mt-8 text-sm text-stone-dim">Loading the money overview…</p>;
  if (rows === null) return <p className="mt-8 text-sm text-red-400">Couldn&apos;t load the money overview.</p>;

  const now = new Date();
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);

  const invoices = rows.filter((r) => r.kind === "invoice");
  const orders = rows.filter((r) => r.kind !== "invoice");
  const paid = (list: MoneyRow[]) => list.filter((r) => r.status === "paid" && r.paid_at);
  const inRange = (list: MoneyRow[], from: number, to: number) => list.filter((r) => new Date(r.paid_at!).getTime() >= from && new Date(r.paid_at!).getTime() < to);

  const paidThis = inRange(paid(invoices), startThis, Infinity);
  const paidLast = inRange(paid(invoices), startLast, startThis);
  const unpaid = invoices.filter((r) => r.status === "unpaid");
  const overdue = unpaid.filter((r) => r.due_date && r.due_date < today);
  const review = invoices.filter((r) => r.status === "needs_review");
  const unfinished = unpaid.filter((r) => r.card_started_at);
  const ordersThis = inRange(paid(orders), startThis, Infinity);

  const methods = new Map<string, number>();
  for (const r of paidThis) methods.set(r.paid_via ?? "other", (methods.get(r.paid_via ?? "other") ?? 0) + r.amount_usd);

  const nameOf = (userId: string) => {
    const c = clients.find((x) => x.id === userId);
    return c?.full_name || c?.email || "Client";
  };
  const recent = paid(invoices)
    .sort((a, b) => b.paid_at!.localeCompare(a.paid_at!))
    .slice(0, 8);
  const chase = [...overdue, ...unpaid.filter((r) => !overdue.includes(r))].slice(0, 6);

  return (
    <section className="mt-2">
      <h2 className="font-display text-2xl text-ivory">Money</h2>
      <p className="mt-1 text-xs text-stone-dim">US dollar amounts (what card and crypto charge). Invoices in other currencies are shown at their dollar value.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Paid this month" value={usd(sum(paidThis))} sub={`${paidThis.length} invoice${paidThis.length === 1 ? "" : "s"}`} tone="gold" />
        <Stat label="Paid last month" value={usd(sum(paidLast))} sub={`${paidLast.length} invoice${paidLast.length === 1 ? "" : "s"}`} />
        <Stat label="Still owed" value={usd(sum(unpaid))} sub={`${unpaid.length} unpaid`} />
        <Stat label="Overdue" value={usd(sum(overdue))} sub={`${overdue.length} past their due date`} tone={overdue.length ? "red" : undefined} />
        <Stat label="Card payments unfinished" value={String(unfinished.length)} sub={unfinished.length ? usd(sum(unfinished)) : "none"} />
        <Stat label="Waiting for a check" value={String(review.length)} sub={review.length ? usd(sum(review)) : "none"} />
      </div>

      {methods.size ? (
        <div className="mt-4 rounded-2xl border hairline bg-charcoal/40 p-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-dim">How it was paid this month</p>
          <ul className="mt-2 space-y-1 text-sm">
            {[...methods.entries()].sort((a, b) => b[1] - a[1]).map(([m, v]) => (
              <li key={m} className="flex justify-between text-ivory">
                <span>{METHOD[m] ?? m}</span>
                <span>{usd(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {chase.length ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-ivory">Money still to collect</h3>
          <ul className="divide-y divide-line rounded-2xl border hairline bg-charcoal/40">
            {chase.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-ivory">{nameOf(r.user_id)}</span>
                  <span className="block truncate text-xs text-stone-dim">
                    {r.reference} · {r.due_date ? `due ${fmtDate(r.due_date)}` : `issued ${fmtDate(r.created_at)}`}
                    {overdue.includes(r) ? " · overdue" : ""}
                  </span>
                </span>
                <span className={`shrink-0 ${overdue.includes(r) ? "text-red-500" : "text-ivory"}`}>{usd(r.amount_usd)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recent.length ? (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-ivory">Latest payments</h3>
          <ul className="divide-y divide-line rounded-2xl border hairline bg-charcoal/40">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-ivory">{nameOf(r.user_id)}</span>
                  <span className="block truncate text-xs text-stone-dim">
                    {r.reference} · {fmtDate(r.paid_at)} · {METHOD[r.paid_via ?? ""] ?? r.paid_via ?? "paid"}
                  </span>
                </span>
                <span className="shrink-0 text-ivory">{usd(r.amount_usd)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {orders.length ? (
        <p className="mt-4 text-xs text-stone-dim">
          Website orders (Travel Credits and gift cards) paid this month: {usd(sum(ordersThis))} ({ordersThis.length}). Not included above.
        </p>
      ) : null}
    </section>
  );
}
