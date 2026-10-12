"use client";

import { useEffect, useState } from "react";
import { loadPriceBook, savePriceItem, type PriceItem } from "@/lib/staff";
import { CURRENCIES, money, type Currency } from "@/lib/money";
import { inputClass } from "./RequestsPanel";

const btn = "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-40";
const CATEGORIES: PriceItem["category"][] = ["Services", "Materials", "Other"];

type Draft = { id: string | null; name: string; details: string; price: string; currency: Currency; unit: string; category: PriceItem["category"]; active: boolean };
const toDraft = (i: PriceItem | null): Draft =>
  i
    ? { id: i.id, name: i.name, details: i.details ?? "", price: String(i.unit_price), currency: i.currency, unit: i.unit ?? "", category: i.category, active: i.active }
    : { id: null, name: "", details: "", price: "", currency: "EUR", unit: "", category: "Services", active: true };

/** Admins: the shared price list staff pick from when building an invoice. */
export function PriceBookPanel() {
  const [items, setItems] = useState<PriceItem[] | null | undefined>(undefined);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const reload = () => loadPriceBook().then(setItems);
  useEffect(() => {
    let alive = true;
    loadPriceBook().then((list) => alive && setItems(list));
    return () => {
      alive = false;
    };
  }, []);

  async function save() {
    if (!draft) return;
    const price = Number(draft.price);
    if (draft.name.trim().length < 2 || !(price >= 0) || draft.price === "") return setMsg("Enter a name and a price.");
    setBusy(true);
    const err = await savePriceItem({
      id: draft.id,
      name: draft.name,
      details: draft.details,
      unit_price: price,
      currency: draft.currency,
      unit: draft.unit,
      category: draft.category,
      active: draft.active,
    });
    setBusy(false);
    setMsg(err ? `Not saved: ${err}` : "Saved.");
    if (!err) {
      setDraft(null);
      reload();
    }
  }

  /** Hide an item from the picker (or show it again). Old invoices are never affected. */
  async function toggle(i: PriceItem) {
    const err = await savePriceItem({ ...i, details: i.details ?? "", unit: i.unit ?? "", active: !i.active });
    setMsg(err ? `Not saved: ${err}` : i.active ? `"${i.name}" is hidden from the picker.` : `"${i.name}" is back in the picker.`);
    if (!err) reload();
  }

  const field = `${inputClass} min-h-11 w-full`;
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ivory">Price book</h2>
      <p className="mt-1 text-xs text-stone-dim">Staff pick from this list when building an invoice and can still change the price or text on that one invoice. Only admins edit the list.</p>
      <button type="button" onClick={() => setDraft(toDraft(null))} className={`${btn} mt-4 bg-ivory text-ink`}>
        + Add item
      </button>
      {msg ? <p role="status" className="mt-3 text-sm text-gold">{msg}</p> : null}

      {draft ? (
        <div className="mt-4 rounded-2xl border border-line p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name, e.g. Train (Round Trip)" aria-label="Name" className={`${field} sm:col-span-2`} />
            <textarea value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} rows={2} placeholder="Default details (optional)" aria-label="Details" className={`${inputClass} resize-y sm:col-span-2`} />
            <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} inputMode="decimal" placeholder="Price" aria-label="Price" className={field} />
            <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value as Currency })} aria-label="Currency" className={`${field} bg-ink`}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="Per (optional), e.g. day" aria-label="Unit" className={field} />
            <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as PriceItem["category"] })} aria-label="Category" className={`${field} bg-ink`}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-stone">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Show in the picker
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={busy} onClick={save} className={`${btn} bg-ivory text-ink`}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className={`${btn} text-stone hover:text-ivory`}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {items === undefined ? (
        <p className="mt-4 text-sm text-stone-dim">Loading…</p>
      ) : items === null ? (
        <p className="mt-4 text-sm text-red-400">Couldn&apos;t load the price book. Has supabase/invoice-builder.sql been run?</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-[24px] border hairline bg-charcoal/40">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className={`truncate text-sm ${i.active ? "text-ivory" : "text-stone-dim line-through"}`}>{i.name}</p>
                <p className="text-xs text-stone-dim">
                  {i.category}
                  {i.details ? ` · ${i.details}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-ivory">
                  {money(i.unit_price, i.currency)}
                  {i.unit ? ` / ${i.unit}` : ""}
                </span>
                <button type="button" onClick={() => setDraft(toDraft(i))} className={`${btn} border border-line text-ivory hover:border-gold`}>
                  Edit
                </button>
                <button type="button" onClick={() => toggle(i)} className={`${btn} text-stone hover:text-ivory`}>
                  {i.active ? "Hide" : "Show"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
