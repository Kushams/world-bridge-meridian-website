"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { fmtUsd } from "@/lib/credits";
import { GiftCardPreview } from "@/components/gift-cards/GiftCardPreview";
import type { GiftDesign } from "@/lib/giftCards";

interface Bucket {
  id: string;
  kind: "standard" | "promo";
  source: string;
  amount_cents: number;
  balance_cents: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
}
interface MyCard {
  id: string;
  amount_cents: number;
  status: "active" | "redeemed" | "void";
  design: string;
  recipient_name: string | null;
  is_self: boolean;
  code: string | null;
  delivered: boolean;
  created_at: string;
}
interface Entry {
  bucket_id: string;
  delta_cents: number;
  note: string | null;
  created_at: string;
}

const cents = (c: number) => fmtUsd(c / 100);
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const SOURCE_LABEL: Record<string, string> = {
  purchase: "Credits purchased",
  gift_card: "Gift card redeemed",
  refund: "Refunded to credits",
  promo: "Promotion",
  voucher: "Voucher redeemed",
  invite: "Invite reward",
  cashback: "Cashback",
  adjustment: "Adjustment",
};

/** The Travel Credits wallet: balances, redeem a code, and the history of every credit and use. */
export function TravelCreditsPanel() {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [ledger, setLedger] = useState<Entry[]>([]);
  const [cards, setCards] = useState<MyCard[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    const [b, l, c] = await Promise.all([
      supabase.from("travel_credit_buckets").select("id, kind, source, amount_cents, balance_cents, expires_at, note, created_at").order("created_at", { ascending: false }),
      supabase.from("travel_credit_ledger").select("bucket_id, delta_cents, note, created_at").order("created_at", { ascending: false }),
      supabase.rpc("my_purchased_gift_cards"),
    ]);
    setCards(Array.isArray(c.data) ? (c.data as MyCard[]) : []);
    setBuckets(Array.isArray(b.data) ? (b.data as Bucket[]) : []);
    setLedger(Array.isArray(l.data) ? (l.data as Entry[]) : []);
  }, [user]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function redeem(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase || busy || !code.trim()) return;
    setBusy(true);
    setResult(null);
    const { data, error } = await supabase.rpc("redeem_gift_card", { p_code: code });
    setBusy(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return setResult({ ok: false, text: "We couldn't check that code just now. Please try again." });
    setResult({ ok: row.ok, text: row.message });
    if (row.ok) {
      setCode("");
      load();
    }
  }

  const [now] = useState(() => Date.now());
  const live = (buckets ?? []).filter((b) => b.balance_cents > 0 && (!b.expires_at || new Date(b.expires_at).getTime() > now));
  const standard = live.filter((b) => b.kind === "standard").reduce((s, b) => s + b.balance_cents, 0);
  const promo = live.filter((b) => b.kind === "promo");
  const promoTotal = promo.reduce((s, b) => s + b.balance_cents, 0);
  const total = standard + promoTotal;
  const history = [
    ...(buckets ?? []).map((b) => ({ at: b.created_at, text: b.note && b.source !== "purchase" && b.note !== SOURCE_LABEL[b.source] ? `${SOURCE_LABEL[b.source] ?? "Credits"} · ${b.note}` : SOURCE_LABEL[b.source] ?? "Credits added", delta: b.amount_cents })),
    ...ledger.map((l) => ({ at: l.created_at, text: l.note || "Used toward a journey", delta: l.delta_cents })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12);

  const daysLeft = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000));

  async function copyCode(c: string) {
    try {
      await navigator.clipboard.writeText(c);
      setCopied(c);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* the code is visible anyway */
    }
  }

  const actions = [
    { href: "/travel-credits#buy", label: "Add credits", icon: "M12 5v14M5 12h14" },
    { href: "/gift-cards#buy", label: "Send a gift", icon: "M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H8a2.5 2.5 0 110-5c2 0 4 2 4 5zm0 0h4a2.5 2.5 0 100-5c-2 0-4 2-4 5z" },
    { href: "/invite", label: "Invite", icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM3 21a9 9 0 0118 0M19 8v6M22 11h-6" },
    { href: "#redeem-code", label: "Redeem", icon: "M3 12l5 5L21 6" },
  ];

  return (
    <div className="space-y-8">
      {/* Wallet card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-8"
        style={{ background: "linear-gradient(135deg,#0f1c33 0%,#1d3a5c 55%,#8a5a22 100%)" }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-[#d9ab63]/20" />
        <p className="relative text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#e6c27a]">World Bridge wallet</p>
        <p className="relative mt-3 text-xs text-white/70">Total balance</p>
        <p className="relative font-display text-5xl tracking-tight md:text-6xl">{buckets === null ? "…" : cents(total)}</p>
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[0.65rem] uppercase tracking-wide text-white/70">Travel Credits</p>
            <p className="mt-1 font-display text-2xl">{buckets === null ? "…" : cents(standard)}</p>
            <p className="mt-1 text-[0.7rem] text-white/60">Never expire</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[0.65rem] uppercase tracking-wide text-white/70">Promo Credits</p>
            <p className="mt-1 font-display text-2xl">{buckets === null ? "…" : cents(promoTotal)}</p>
            <p className="mt-1 text-[0.7rem] text-white/60">{promo.length ? `${promo.length} reward${promo.length > 1 ? "s" : ""} · expire` : "Rewards & vouchers"}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {actions.map((a) => (
          <Link key={a.label} href={a.href} className="group flex flex-col items-center gap-2 text-xs font-medium text-ivory-dim hover:text-gold">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-charcoal text-ivory transition-colors group-hover:border-gold group-hover:text-gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={a.icon} />
              </svg>
            </span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Promo credits with countdowns */}
      {promo.length ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory">Rewards expiring</p>
          <ul className="space-y-3">
            {promo.map((b) => {
              const left = daysLeft(b.expires_at!);
              const span = Math.max(1, Math.round((new Date(b.expires_at!).getTime() - new Date(b.created_at).getTime()) / 86400000));
              return (
                <li key={b.id} className="rounded-2xl border hairline bg-charcoal p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-xl text-ivory">{cents(b.balance_cents)}</span>
                    <span className="text-xs text-stone-dim">{left} day{left === 1 ? "" : "s"} left · {fmt(b.expires_at!)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone">{SOURCE_LABEL[b.source] ?? "Promo"}{b.note && b.source !== "purchase" && b.note !== SOURCE_LABEL[b.source] ? ` · ${b.note}` : ""}</p>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (left / span) * 100)}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Gift cards I bought */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ivory">My gift cards</p>
          <Link href="/gift-cards#buy" className="text-xs text-gold underline underline-offset-4">Buy one</Link>
        </div>
        {cards.length ? (
          <ul className="flex snap-x gap-4 overflow-x-auto pb-2">
            {cards.map((c) => (
              <li key={c.id} className="w-[17rem] shrink-0 snap-start">
                <GiftCardPreview design={(c.design === "seasonal" ? "seasonal" : "classic") as GiftDesign} amount={cents(c.amount_cents)} small />
                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-stone">
                    {c.is_self ? "For you" : `For ${c.recipient_name || "a friend"}`} · {fmt(c.created_at)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide ${c.status === "redeemed" ? "bg-line text-stone" : c.delivered ? "bg-gold/15 text-gold" : "bg-line text-stone-dim"}`}>
                    {c.status === "redeemed" ? "Redeemed" : c.delivered ? "Sent" : "Preparing"}
                  </span>
                </div>
                {c.code ? (
                  <button type="button" onClick={() => copyCode(c.code!)} className="mt-2 w-full rounded-xl border border-dashed border-line px-3 py-2 text-left font-mono text-xs tracking-widest text-ivory hover:border-gold">
                    {c.code} <span className="float-right font-sans text-[0.65rem] uppercase tracking-wide text-gold">{copied === c.code ? "Copied" : "Copy"}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border hairline bg-charcoal p-4 text-sm text-stone">Gift cards you buy appear here once we have confirmed your payment.</p>
        )}
      </div>

      {/* Redeem */}
      <form id="redeem-code" onSubmit={redeem} className="scroll-mt-28 rounded-2xl border hairline bg-charcoal p-5">
        <label htmlFor="gc-code" className="block text-xs font-semibold uppercase tracking-wide text-ivory">Redeem a gift card or voucher code</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="gc-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-control border border-line bg-transparent px-4 py-3 font-mono text-sm tracking-widest text-ivory outline-none focus:border-gold"
          />
          <button type="submit" disabled={busy} className="shrink-0 rounded-full bg-ivory px-7 py-3 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50">
            {busy ? "Checking…" : "Redeem"}
          </button>
        </div>
        {result ? <p role="status" className={`mt-3 text-sm ${result.ok ? "text-gold" : "text-red-500"}`}>{result.text}</p> : null}
        <p className="mt-3 text-xs text-stone-dim">
          Read the <Link href="/travel-credits#credit-terms" className="underline underline-offset-4">Travel Credit terms</Link>.
        </p>
      </form>

      {/* Activity */}
      {history.length ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory">Activity</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border hairline bg-charcoal">
            {history.map((h, i) => (
              <li key={i} className="flex items-center gap-3 p-3.5">
                <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${h.delta < 0 ? "bg-line text-ivory" : "bg-gold/15 text-gold"}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={h.delta < 0 ? "M7 17L17 7M9 7h8v8" : "M17 7L7 17M15 17H7V9"} />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ivory">{h.text}</span>
                  <span className="block text-xs text-stone-dim">{fmt(h.at)}</span>
                </span>
                <span className={`shrink-0 font-display text-base ${h.delta < 0 ? "text-ivory" : "text-gold"}`}>{h.delta < 0 ? "−" : "+"}{cents(Math.abs(h.delta))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
