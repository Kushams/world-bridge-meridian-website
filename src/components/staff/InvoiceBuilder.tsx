"use client";

import { useEffect, useState } from "react";
import { createInvoiceV2, loadPriceBook, notifyClient, savePriceItem, uploadFile, type Client, type PriceItem } from "@/lib/staff";
import { CURRENCIES, fetchUsdRate, money, totals, type Currency } from "@/lib/money";
import { buildInvoicePdf, loadEmblem } from "@/lib/invoicePdf";
import { inputClass } from "./RequestsPanel";

const DOCS = "client-documents";
const btn = "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-40";

interface Line {
  id: number;
  title: string;
  details: string;
  qty: string;
  price: string;
  /** Picked from the price book (so there is nothing new to save). */
  fromBook: boolean;
  /** Admins: remember this typed line in the price book when the invoice is created. */
  save: boolean;
  /** Admins: also change the price book item with the same name to this price. */
  update: boolean;
}
let seq = 0;
const blankLine = (over: Partial<Line> = {}): Line => ({ id: ++seq, title: "", details: "", qty: "1", price: "", fromBook: false, save: true, update: false, ...over });

/** Pick items from the shared price book, grouped like the app's Price book screen. */
function PricePicker({ currency, onPick, onClose }: { currency: Currency; onPick: (item: PriceItem) => void; onClose: () => void }) {
  const [items, setItems] = useState<PriceItem[] | null | undefined>(undefined);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | PriceItem["category"]>("All");

  useEffect(() => {
    let alive = true;
    loadPriceBook().then((list) => alive && setItems(list));
    return () => {
      alive = false;
    };
  }, []);

  const shown = (items ?? []).filter((i) => i.active && (cat === "All" || i.category === cat) && (!q.trim() || `${i.name} ${i.details ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <div role="dialog" aria-modal="true" aria-label="Price book" className="fixed inset-0 z-50 flex flex-col bg-ink">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pb-2 pt-4">
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border hairline text-xl text-ivory">
          ×
        </button>
        <p className="flex-1 text-center font-display text-xl text-ivory">Price book</p>
        <span className="w-11" />
      </div>
      <div className="mx-auto w-full max-w-3xl px-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className={`${inputClass} h-12 w-full rounded-full px-5`} />
        <div role="tablist" className="mt-3 grid grid-cols-4 rounded-full border hairline p-1">
          {(["All", "Services", "Materials", "Other"] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`min-h-10 rounded-full text-xs font-semibold ${cat === c ? "bg-ivory text-ink" : "text-stone"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-3 w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-8">
        {items === undefined ? (
          <p className="text-sm text-stone-dim">Loading…</p>
        ) : items === null ? (
          <p className="text-sm text-red-400">Couldn&apos;t load the price book. Has invoice-builder.sql been run?</p>
        ) : !shown.length ? (
          <p className="text-sm text-stone-dim">Nothing matches.</p>
        ) : (
          <ul className="divide-y divide-line rounded-[24px] border hairline bg-charcoal/40">
            {shown.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(i);
                    onClose();
                  }}
                  className="flex min-h-[64px] w-full items-center justify-between gap-3 px-5 py-3 text-left active:bg-ivory/5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ivory">{i.name}</span>
                    {i.details ? <span className="block truncate text-xs text-stone-dim">{i.details}</span> : null}
                  </span>
                  <span className={`shrink-0 text-sm ${i.currency === currency ? "text-ivory" : "text-gold"}`}>
                    {money(i.unit_price, i.currency)}
                    {i.unit ? ` / ${i.unit}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Build an invoice from line items. The database recomputes totals; the branded PDF is made and attached on creation. */
export function InvoiceBuilder({ client, admin, onDone }: { client: Client; admin: boolean; onDone: (msg: string) => void }) {
  const email = client.email;
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [tax, setTax] = useState("0");
  const [due, setDue] = useState("");
  const [rate, setRate] = useState("");
  const [rateNote, setRateNote] = useState("");
  const [lines, setLines] = useState<Line[]>([blankLine()]);
  const [picker, setPicker] = useState(false);
  const [book, setBook] = useState<PriceItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  // Admins: keep a copy of the price book to spot lines whose price differs from the book.
  useEffect(() => {
    if (!admin) return;
    let alive = true;
    loadPriceBook().then((list) => alive && setBook((list ?? []).filter((i) => i.active)));
    return () => {
      alive = false;
    };
  }, [admin]);
  const matchOf = (l: Line) => book.find((i) => i.name.trim().toLowerCase() === l.title.trim().toLowerCase());

  // Fetch today's rate to US dollars whenever the currency changes (staff can overwrite it).
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      if (currency === "USD") {
        setRate("1");
        setRateNote("");
        return;
      }
      setRateNote("Fetching today's rate…");
      fetchUsdRate(currency).then((r) => {
        if (!alive) return;
        if (r) {
          setRate(r.toFixed(4));
          setRateNote(`ECB rate today. Card and crypto will charge in US dollars at this rate.`);
        } else {
          setRateNote("Couldn't fetch the rate: type it in.");
        }
      });
    }, 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [currency]);

  const { subtotal, tax: taxAmount, total } = totals(
    lines.map((l) => ({ qty: Number(l.qty), unit_price: Number(l.price) })),
    Number(tax) || 0,
  );
  const rateN = currency === "USD" ? 1 : Number(rate);
  const usd = Math.round(total * (rateN || 0) * 100) / 100;

  const patch = (id: number, change: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...change } : l)));

  function addFromBook(item: PriceItem) {
    setLines((ls) => {
      const fresh = blankLine({ title: item.name, details: item.details ?? "", price: String(item.unit_price), fromBook: true, save: false });
      const onlyBlank = ls.length === 1 && !ls[0].title && !ls[0].price;
      return onlyBlank ? [fresh] : [...ls, fresh];
    });
    if (item.currency !== currency && lines.every((l) => !l.title && !l.price)) setCurrency(item.currency);
    else if (item.currency !== currency) setNote(`"${item.name}" is priced in ${item.currency} but this invoice is in ${currency}. Check the price.`);
  }

  async function create() {
    setNote("");
    const clean = lines.filter((l) => l.title.trim() || l.price);
    if (!clean.length) return setNote("Add at least one line.");
    for (const l of clean) {
      if (l.title.trim().length < 3) return setNote("Every line needs a name (3+ letters).");
      if (!(Number(l.qty) > 0) || !(Number(l.price) >= 0) || l.price === "") return setNote(`Check the quantity and price on "${l.title}".`);
    }
    if (currency !== "USD" && !(rateN > 0)) return setNote("Enter the exchange rate to US dollars.");
    if (usd < 5) return setNote("The total must be at least US$5.");
    setBusy(true);
    const payloadLines = clean.map((l) => ({ title: l.title.trim(), details: l.details.trim(), qty: Number(l.qty), unit_price: Number(l.price) }));
    const { reference, error } = await createInvoiceV2({ email, currency, taxPercent: Number(tax) || 0, fxRate: rateN, lines: payloadLines, due: due || null });
    if (error || !reference) {
      setBusy(false);
      return setNote(`Not created: ${error ?? "something went wrong"}`);
    }
    // Branded PDF, attached straight away so the client's "View invoice (PDF)" button works.
    let pdfOk = false;
    try {
      const t = totals(payloadLines, Number(tax) || 0);
      const blob = await buildInvoicePdf(
        {
          reference,
          createdAt: new Date().toISOString(),
          dueDate: due || null,
          status: "unpaid",
          paidAt: null,
          currency,
          lines: payloadLines.map((l) => ({ ...l, amount: Math.round(l.qty * l.unit_price * 100) / 100 })),
          subtotal: t.subtotal,
          taxPercent: Number(tax) || 0,
          total: t.total,
          amountUsd: usd,
          fxRate: rateN,
        },
        { name: client.full_name, email, phone: client.phone },
        await loadEmblem(),
      );
      pdfOk = !(await uploadFile(DOCS, `${email}/invoices/${reference}.pdf`, new File([blob], `${reference}.pdf`, { type: "application/pdf" })));
    } catch {
      pdfOk = false;
    }
    const emailed = await notifyClient(email, "invoice", `${reference} — ${payloadLines[0].title}${payloadLines.length > 1 ? ` + ${payloadLines.length - 1} more` : ""}`);
    // Remember new typed lines in the price book (admins), so next time they are one tap away.
    let remembered = 0;
    let updated = 0;
    if (admin) {
      const fresh = (await loadPriceBook()) ?? [];
      const known = new Set(fresh.map((i) => i.name.trim().toLowerCase()));
      for (const l of clean) {
        const name = l.title.trim();
        const existing = fresh.find((i) => i.name.trim().toLowerCase() === name.toLowerCase());
        if (existing && l.update && Number(l.price) !== existing.unit_price) {
          const err = await savePriceItem({ ...existing, unit_price: Number(l.price), details: l.details.trim() || existing.details });
          if (!err) updated++;
          continue;
        }
        if (l.fromBook || !l.save || known.has(name.toLowerCase())) continue;
        const err = await savePriceItem({ id: null, name, details: l.details.trim(), unit_price: Number(l.price), currency, unit: "", category: "Services", active: true });
        if (!err) {
          remembered++;
          known.add(name.toLowerCase());
        }
      }
    }
    setBusy(false);
    setLines([blankLine()]);
    setTax("0");
    setDue("");
    onDone(`Invoice ${reference} created (${money(total, currency)})${pdfOk ? " with its branded PDF" : " (the PDF could not be made: use Generate PDF)"}${emailed ? " and the client has been emailed." : "."}${remembered ? ` ${remembered} new item${remembered === 1 ? "" : "s"} saved to the price book.` : ""}${updated ? ` ${updated} price${updated === 1 ? "" : "s"} updated in the price book.` : ""}`);
  }

  const field = `${inputClass} min-h-11 w-full`;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="text-xs text-stone-dim">
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={`${field} mt-1 bg-ink`}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-stone-dim">
          Tax %
          <input value={tax} onChange={(e) => setTax(e.target.value)} inputMode="decimal" placeholder="0" className={`${field} mt-1`} />
        </label>
        <div className="col-span-2 text-xs text-stone-dim">
          <label htmlFor="inv-due">Due date (your choice, or leave empty for &ldquo;due on receipt&rdquo;)</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input id="inv-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${field} min-w-44 flex-1`} />
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDue(new Date(Date.now() + d * 86400000).toISOString().slice(0, 10))}
                className="min-h-11 rounded-full border border-line px-3 text-xs font-semibold text-ivory hover:border-gold"
              >
                +{d} days
              </button>
            ))}
            {due ? (
              <button type="button" onClick={() => setDue("")} className="min-h-11 px-2 text-xs text-stone hover:text-ivory">
                Clear
              </button>
            ) : null}
          </div>
        </div>
        {currency !== "USD" ? (
          <label className="text-xs text-stone-dim">
            1 {currency} = USD
            <input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" className={`${field} mt-1`} />
          </label>
        ) : null}
      </div>
      {rateNote ? <p className="mt-1 text-xs text-stone-dim">{rateNote}</p> : null}

      <ul className="mt-5 space-y-4">
        {lines.map((l, i) => (
          <li key={l.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-start gap-2">
              <input value={l.title} onChange={(e) => patch(l.id, { title: e.target.value })} placeholder={`Line ${i + 1}: name, e.g. Accommodation`} aria-label={`Line ${i + 1} name`} className={`${field} font-semibold`} />
              <button type="button" aria-label={`Remove line ${i + 1}`} onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.id !== l.id) : [blankLine()]))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-stone hover:border-red-400 hover:text-red-400">
                ×
              </button>
            </div>
            <textarea value={l.details} onChange={(e) => patch(l.id, { details: e.target.value })} rows={3} maxLength={1000} placeholder="Details shown under the name (hotel, dates, route, passengers…)" aria-label={`Line ${i + 1} details`} className={`${inputClass} mt-2 w-full resize-y`} />
            {admin && l.title.trim().length >= 3 ? (
              matchOf(l) ? (
                l.price !== "" && Number(l.price) !== matchOf(l)!.unit_price ? (
                  <label className="mt-2 flex items-center gap-2 text-xs text-stone">
                    <input type="checkbox" checked={l.update} onChange={(e) => patch(l.id, { update: e.target.checked })} />
                    Also change the price book price ({money(matchOf(l)!.unit_price, matchOf(l)!.currency)} → {money(Number(l.price), matchOf(l)!.currency)})
                  </label>
                ) : null
              ) : (
                <label className="mt-2 flex items-center gap-2 text-xs text-stone">
                  <input type="checkbox" checked={l.save} onChange={(e) => patch(l.id, { save: e.target.checked })} />
                  Save this to the price book so I can pick it next time
                </label>
              )
            ) : null}
            <div className="mt-2 grid grid-cols-[90px_1fr_auto] items-center gap-2">
              <input value={l.qty} onChange={(e) => patch(l.id, { qty: e.target.value })} inputMode="decimal" aria-label={`Line ${i + 1} quantity`} placeholder="Qty" className={field} />
              <input value={l.price} onChange={(e) => patch(l.id, { price: e.target.value })} inputMode="decimal" aria-label={`Line ${i + 1} price`} placeholder={`Price (${currency})`} className={field} />
              <span className="min-w-20 text-right text-sm text-ivory">{money((Number(l.qty) || 0) * (Number(l.price) || 0), currency)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPicker(true)} className={`${btn} bg-ivory text-ink`}>
          + From price book
        </button>
        <button type="button" onClick={() => setLines((ls) => [...ls, blankLine()])} className={`${btn} border border-line text-ivory hover:border-gold`}>
          + Custom line
        </button>
      </div>

      <dl className="mt-5 space-y-1 rounded-2xl border border-line p-4 text-sm">
        <div className="flex justify-between text-stone">
          <dt>Subtotal</dt>
          <dd>{money(subtotal, currency)}</dd>
        </div>
        {Number(tax) > 0 ? (
          <div className="flex justify-between text-stone">
            <dt>Tax {Number(tax)}%</dt>
            <dd>{money(taxAmount, currency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between font-display text-lg text-ivory">
          <dt>Total</dt>
          <dd>{money(total, currency)}</dd>
        </div>
        {currency !== "USD" && rateN > 0 ? (
          <div className="flex justify-between text-xs text-stone-dim">
            <dt>Card / crypto charge</dt>
            <dd>{money(usd, "USD")}</dd>
          </div>
        ) : null}
      </dl>

      <button type="button" disabled={busy} onClick={create} className="mt-4 h-12 w-full rounded-full bg-ivory text-sm font-semibold uppercase tracking-wide text-ink active:scale-[0.98] disabled:opacity-40">
        {busy ? "Creating…" : "Create invoice and PDF"}
      </button>
      {note ? (
        <p role="status" className="mt-3 text-sm text-red-400">
          {note}
        </p>
      ) : null}
      {picker ? <PricePicker currency={currency} onPick={addFromBook} onClose={() => setPicker(false)} /> : null}
    </div>
  );
}
