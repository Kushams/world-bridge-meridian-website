"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { GiftCardPreview } from "@/components/gift-cards/GiftCardPreview";
import { usdFromCents, type GiftDesign } from "@/lib/giftCards";

interface Card {
  id: string;
  code: string;
  amount_cents: number;
  balance_cents: number;
  design: GiftDesign;
  status: string;
}
interface Entry {
  card_id: string;
  delta_cents: number;
  note: string | null;
  created_at: string;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Redeem a gift card code, see balances, and read the spend history. */
export function GiftCardsPanel() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    const [c, h] = await Promise.all([
      supabase.from("gift_cards").select("id, code, amount_cents, balance_cents, design, status").order("claimed_at", { ascending: false }),
      supabase.from("gift_card_ledger").select("card_id, delta_cents, note, created_at").order("created_at", { ascending: false }),
    ]);
    setCards((c.data ?? []) as Card[]);
    setHistory((h.data ?? []) as Entry[]);
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

  return (
    <div className="space-y-8">
      <form onSubmit={redeem} className="max-w-xl space-y-3">
        <label htmlFor="gc-code" className="block text-xs uppercase tracking-wide text-stone">Enter a gift card code</label>
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
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-full bg-ivory px-7 py-3 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Redeem"}
          </button>
        </div>
        {result ? (
          <p role="status" className={`text-sm ${result.ok ? "text-gold" : "text-red-500"}`}>{result.text}</p>
        ) : null}
        <p className="text-xs text-stone-dim">
          Don&apos;t have one? <Link href="/gift-cards" className="underline underline-offset-4">Buy a gift card</Link>.
        </p>
      </form>

      {cards === null ? (
        <p className="text-sm text-stone-dim">Loading your gift cards…</p>
      ) : cards.length === 0 ? (
        <p className="text-sm text-stone-dim">No gift cards in your account yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((c) => {
            const entries = history.filter((h) => h.card_id === c.id);
            return (
              <li key={c.id} className="space-y-4">
                <GiftCardPreview design={c.design} amount={usdFromCents(c.balance_cents)} tail={c.code.slice(-4)} small />
                <p className="text-sm text-stone">
                  Balance <b className="text-ivory">{usdFromCents(c.balance_cents)}</b> of {usdFromCents(c.amount_cents)}
                  {c.status !== "active" ? " · no longer active" : ""}
                </p>
                {entries.length ? (
                  <ul className="divide-y divide-line rounded-card border hairline text-sm">
                    {entries.map((h, i) => (
                      <li key={i} className="flex justify-between gap-3 p-3">
                        <span className="text-stone">{h.note || "Used toward a journey"} · {fmt(h.created_at)}</span>
                        <span className="text-ivory">{h.delta_cents < 0 ? "−" : "+"}{usdFromCents(Math.abs(h.delta_cents))}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
