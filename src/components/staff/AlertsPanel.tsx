"use client";

import type { ReactNode } from "react";
import { fmtDate, usd, type AttentionData, type Client } from "@/lib/staff";

const ago = (iso: string) => {
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
  if (h < 1) return "just now";
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  if (!count) return null;
  return (
    <section className="mt-6">
      <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ivory">
        {title} <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-white">{count}</span>
      </h2>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

function Item({ title, sub, meta, onClick }: { title: string; sub: string; meta: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[72px] w-full items-center gap-4 rounded-[24px] border hairline bg-charcoal/40 px-5 py-3 text-left shadow-sm transition active:scale-[0.99] hover:border-gold/60"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ivory">{title}</span>
          <span className="block truncate text-xs text-stone-dim">{sub}</span>
        </span>
        <span className="shrink-0 text-xs text-gold">{meta}</span>
        <span aria-hidden className="text-stone">→</span>
      </button>
    </li>
  );
}

/** Alerts: what needs a person (stale requests, invoices to chase, card payments left unfinished). Tapping an item opens that client. */
export function AlertsPanel({ data, clients, onOpenClient }: { data: AttentionData | null | undefined; clients: Client[]; onOpenClient: (email: string) => void }) {
  if (data === undefined) return <p className="text-sm text-stone-dim">Checking what needs attention…</p>;
  if (data === null) return <p className="text-sm text-red-400">Couldn&apos;t load this list. Refresh the page to try again.</p>;

  const nameOf = (email: string) => clients.find((c) => c.email === email)?.full_name || email;
  const emailOf = (userId: string) => clients.find((c) => c.id === userId)?.email;
  const total = data.stuck.length + data.invoices.length + data.checkouts.length;

  if (!total) {
    return (
      <div className="rounded-[24px] border hairline bg-charcoal/40 px-6 py-10 text-center">
        <p className="font-display text-2xl text-ivory">All clear ✓</p>
        <p className="mt-2 text-sm text-stone">No stale requests, no unfinished card payments and no overdue invoices. New messages are in the Inbox tab.</p>
      </div>
    );
  }

  return (
    <div>
      <Group title="Card payment not finished" count={data.checkouts.length}>
        {data.checkouts.map((i) => {
          const email = emailOf(i.user_id);
          return (
            <Item
              key={i.id}
              title={`${usd(i.amount_usd)} · ${i.description}`}
              sub={`${email ? nameOf(email) : "Client"} · ${i.reference} · didn't finish paying`}
              meta={`Started ${ago(i.card_started_at!)}`}
              onClick={() => email && onOpenClient(email)}
            />
          );
        })}
      </Group>
      <Group title="Requests not started" count={data.stuck.length}>
        {data.stuck.map((r) => (
          <Item
            key={r.id}
            title={r.name || r.email || "No name"}
            sub={r.subject || "Request"}
            meta={`Sent ${ago(r.submitted_at)}`}
            onClick={() => r.email && onOpenClient(r.email.toLowerCase())}
          />
        ))}
      </Group>
      <Group title="Invoices to chase" count={data.invoices.length}>
        {data.invoices.map((i) => {
          const email = emailOf(i.user_id);
          return (
            <Item
              key={i.id}
              title={`${usd(i.amount_usd)} · ${i.description}`}
              sub={`${email ? nameOf(email) : "Client"} · ${i.reference} · issued ${fmtDate(i.created_at)}${i.last_opened_at ? ` · opened ${ago(i.last_opened_at)}` : " · not opened yet"}`}
              meta={i.status === "needs_review" ? "Check payment" : "Unpaid"}
              onClick={() => email && onOpenClient(email)}
            />
          );
        })}
      </Group>
    </div>
  );
}
