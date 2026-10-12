export type Currency = "USD" | "EUR" | "GBP";
export const CURRENCIES: Currency[] = ["EUR", "USD", "GBP"];

const SYMBOL: Record<Currency, string> = { USD: "US$", EUR: "€", GBP: "£" };

/** 1234.5 → "€1,234.50" (USD shows as "US$"). */
export function money(n: number, currency: Currency | string = "USD"): string {
  const sym = SYMBOL[currency as Currency] ?? `${currency} `;
  return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface LineItem {
  title: string;
  details?: string;
  qty: number;
  unit_price: number;
  amount?: number;
}

export const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Same arithmetic the database uses: lines → subtotal, tax, total. */
export function totals(lines: { qty: number; unit_price: number }[], taxPercent: number) {
  const subtotal = roundMoney(lines.reduce((s, l) => s + roundMoney((Number(l.qty) || 0) * (Number(l.unit_price) || 0)), 0));
  const tax = roundMoney((subtotal * (Number(taxPercent) || 0)) / 100);
  return { subtotal, tax, total: roundMoney(subtotal + tax) };
}

/** Live rate to US dollars (Coinbase spot price, moves all day); falls back to the daily European Central Bank rate. null if neither works. */
export async function fetchLiveUsdRate(from: Currency): Promise<number | null> {
  if (from === "USD") return 1;
  try {
    const res = await fetch(`https://api.coinbase.com/v2/prices/${from}-USD/spot`, { cache: "no-store" });
    if (res.ok) {
      const rate = Number(((await res.json()) as { data?: { amount?: string } }).data?.amount);
      if (rate > 0.2 && rate < 5) return rate;
    }
  } catch {
    // fall through to the ECB rate
  }
  return fetchUsdRate(from);
}

/** Today's rate to US dollars from the European Central Bank feed. null if it can't be fetched (staff can type one). */
export async function fetchUsdRate(from: Currency): Promise<number | null> {
  if (from === "USD") return 1;
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=USD`);
    if (!res.ok) return null;
    const rate = ((await res.json()) as { rates?: { USD?: number } }).rates?.USD;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
