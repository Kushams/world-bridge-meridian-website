"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { fmtUsd } from "@/lib/credits";

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
  adjustment: "Adjustment",
};

/** The Travel Credits wallet: balances, redeem a code, and the history of every credit and use. */
export function TravelCreditsPanel() {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [ledger, setLedger] = useState<Entry[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    const [b, l] = await Promise.all([
      supabase.from("travel_credit_buckets").select("id, kind, source, amount_cents, balance_cents, expires_at, note, created_at").order("created_at", { ascending: false }),
      supabase.from("travel_credit_ledger").select("bucket_id, delta_cents, note, created_at").order("created_at", { ascending: false }),
    ]);
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
  const history = [
    ...(buckets ?? []).map((b) => ({ at: b.created_at, text: b.note && b.source !== "purchase" ? `${SOURCE_LABEL[b.source]} · ${b.note}` : SOURCE_LABEL[b.source] ?? "Credits added", delta: b.amount_cents })),
    ...ledger.map((l) => ({ at: l.created_at, text: l.note || "Used toward a journey", delta: l.delta_cents })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-card border hairline bg-charcoal p-6">
          <p className="eyebrow !text-[0.65rem]">Travel Credits</p>
          <p className="mt-2 font-display text-3xl text-ivory">{buckets === null ? "…" : cents(standard)}</p>
          <p className="mt-1 text-xs text-stone-dim">Never expire. Usable on any booking.</p>
        </div>
        <div className="rounded-card border hairline bg-charcoal p-6">
          <p className="eyebrow !text-[0.65rem]">Promo Credits</p>
          <p className="mt-2 font-display text-3xl text-ivory">{buckets === null ? "…" : cents(promoTotal)}</p>
          {promo.length ? (
            <ul className="mt-1 space-y-0.5 text-xs text-stone-dim">
              {promo.map((b) => (
                <li key={b.id}>{cents(b.balance_cents)} expires {fmt(b.expires_at!)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-stone-dim">Rewards and vouchers appear here, with their expiry date.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/travel-credits#buy" className="rounded-full bg-ivory px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90">Buy Travel Credits</Link>
        <Link href="/gift-cards" className="rounded-full border border-line px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory hover:border-gold hover:text-gold">Gift a card</Link>
        <Link href="/invite" className="rounded-full border border-line px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ivory hover:border-gold hover:text-gold">Invite &amp; earn</Link>
      </div>

      <form onSubmit={redeem} className="max-w-xl space-y-3">
        <label htmlFor="gc-code" className="block text-xs uppercase tracking-wide text-stone">Redeem a gift card or voucher code</label>
        <div className="flex flex-col gap-3 sm:flex-row">
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
        {result ? <p role="status" className={`text-sm ${result.ok ? "text-gold" : "text-red-500"}`}>{result.text}</p> : null}
        <p className="text-xs text-stone-dim">
          Read the <Link href="/travel-credits#credit-terms" className="underline underline-offset-4">Travel Credit terms</Link>.
        </p>
      </form>

      {history.length ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory">History</p>
          <ul className="divide-y divide-line rounded-card border hairline text-sm">
            {history.map((h, i) => (
              <li key={i} className="flex justify-between gap-3 p-3">
                <span className="text-stone">{h.text} · {fmt(h.at)}</span>
                <span className={h.delta < 0 ? "text-ivory" : "text-gold"}>{h.delta < 0 ? "−" : "+"}{cents(Math.abs(h.delta))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
