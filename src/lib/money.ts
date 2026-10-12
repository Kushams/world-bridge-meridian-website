/** An ISO 4217 code such as "EUR" or "CAD". */
export type Currency = string;

/** Currencies staff can invoice in: the places clients pay crypto from, without the African currencies. USD, EUR and GBP first. */
export const CURRENCY_LIST: { code: string; name: string }[] = [
  { code: "USD", name: "US dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British pound" },
  { code: "CAD", name: "Canadian dollar" },
  { code: "AUD", name: "Australian dollar" },
  { code: "NZD", name: "New Zealand dollar" },
  { code: "CHF", name: "Swiss franc" },
  { code: "SEK", name: "Swedish krona" },
  { code: "NOK", name: "Norwegian krone" },
  { code: "DKK", name: "Danish krone" },
  { code: "ISK", name: "Icelandic króna" },
  { code: "PLN", name: "Polish złoty" },
  { code: "CZK", name: "Czech koruna" },
  { code: "HUF", name: "Hungarian forint" },
  { code: "RON", name: "Romanian leu" },
  { code: "BGN", name: "Bulgarian lev" },
  { code: "TRY", name: "Turkish lira" },
  { code: "UAH", name: "Ukrainian hryvnia" },
  { code: "GEL", name: "Georgian lari" },
  { code: "AED", name: "UAE dirham" },
  { code: "SAR", name: "Saudi riyal" },
  { code: "QAR", name: "Qatari riyal" },
  { code: "KWD", name: "Kuwaiti dinar" },
  { code: "BHD", name: "Bahraini dinar" },
  { code: "OMR", name: "Omani rial" },
  { code: "ILS", name: "Israeli shekel" },
  { code: "INR", name: "Indian rupee" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "LKR", name: "Sri Lankan rupee" },
  { code: "CNY", name: "Chinese yuan" },
  { code: "HKD", name: "Hong Kong dollar" },
  { code: "TWD", name: "Taiwan dollar" },
  { code: "JPY", name: "Japanese yen" },
  { code: "KRW", name: "South Korean won" },
  { code: "SGD", name: "Singapore dollar" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "THB", name: "Thai baht" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "PHP", name: "Philippine peso" },
  { code: "VND", name: "Vietnamese dong" },
  { code: "KZT", name: "Kazakhstani tenge" },
  { code: "MXN", name: "Mexican peso" },
  { code: "BRL", name: "Brazilian real" },
  { code: "ARS", name: "Argentine peso" },
  { code: "CLP", name: "Chilean peso" },
  { code: "COP", name: "Colombian peso" },
  { code: "PEN", name: "Peruvian sol" },
  { code: "UYU", name: "Uruguayan peso" },
  { code: "DOP", name: "Dominican peso" },
  { code: "CRC", name: "Costa Rican colón" },
  { code: "JMD", name: "Jamaican dollar" },
];
export const CURRENCIES: Currency[] = CURRENCY_LIST.map((c) => c.code);

const SYMBOL: Record<string, string> = { USD: "US$", EUR: "€", GBP: "£" };

/** 1234.5 → "€1,234.50" (USD shows as "US$"; other currencies lead with their code, e.g. "CAD 1,234.50"). */
export function money(n: number, currency: Currency = "USD"): string {
  const sym = SYMBOL[currency] ?? `${currency} `;
  return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** An exchange rate with enough digits for tiny ones (VND, IDR): 1.1157, 0.0063071, 0.0000385550. */
export function rateText(r: number): string {
  const digits = r >= 0.1 ? 4 : Math.min(10, 4 + Math.ceil(-Math.log10(r)));
  return r.toFixed(digits);
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
      if (rate > 0 && rate < 1000) return rate;
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
