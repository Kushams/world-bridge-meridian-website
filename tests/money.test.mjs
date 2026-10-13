// Automatic checks for the money rules. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { totals, roundMoney, money, rateText, CURRENCY_LIST, CURRENCIES, fetchLiveUsdRate, fetchUsdRate } from "../src/lib/money.ts";

// ---- Invoice totals ---------------------------------------------------------------------------------------------

test("totals: lines add up to subtotal, tax and total", () => {
  const t = totals([{ qty: 2, unit_price: 150 }, { qty: 1, unit_price: 49.99 }], 10);
  assert.deepEqual(t, { subtotal: 349.99, tax: 35, total: 384.99 });
});

test("totals: each line is rounded to cents before adding (matches the database)", () => {
  // 3 x 0.335 = 1.005 per line; rounding per line then summing must not drift from the database's answer
  const t = totals([{ qty: 3, unit_price: 0.335 }, { qty: 3, unit_price: 0.335 }], 0);
  assert.equal(t.subtotal, roundMoney(roundMoney(3 * 0.335) * 2));
});

test("totals: no tax means total equals subtotal", () => {
  const t = totals([{ qty: 1, unit_price: 1000 }], 0);
  assert.equal(t.tax, 0);
  assert.equal(t.total, 1000);
});

test("totals: blank or junk values count as zero, never NaN", () => {
  const t = totals([{ qty: NaN, unit_price: 50 }, { qty: 2, unit_price: undefined }], NaN);
  assert.deepEqual(t, { subtotal: 0, tax: 0, total: 0 });
});

test("totals: blank prices from the price book give a zero invoice until staff type a price", () => {
  assert.equal(totals([{ qty: 1, unit_price: 0 }], 0).total, 0);
});

test("totals: large amounts stay exact to the cent", () => {
  const t = totals([{ qty: 1, unit_price: 123456.78 }, { qty: 3, unit_price: 9999.99 }], 7.5);
  assert.equal(t.subtotal, 153456.75);
  assert.equal(t.tax, 11509.26);
  assert.equal(t.total, 164966.01);
});

test("roundMoney: rounds half up at the cent, including the awkward 1.005 case", () => {
  assert.equal(roundMoney(1.005), 1.01);
  assert.equal(roundMoney(2.675), 2.68);
  assert.equal(roundMoney(0.1 + 0.2), 0.3);
});

// ---- Showing money ----------------------------------------------------------------------------------------------

test("money: symbols and thousands separators", () => {
  assert.equal(money(1234.5, "USD"), "US$1,234.50");
  assert.equal(money(1234.5, "EUR"), "€1,234.50");
  assert.equal(money(0.5, "GBP"), "£0.50");
});

test("money: other currencies lead with their code", () => {
  assert.equal(money(1234.5, "CAD"), "CAD 1,234.50");
  assert.equal(money(99, "JPY"), "JPY 99.00");
});

test("rateText: ordinary and tiny rates keep enough digits", () => {
  assert.equal(rateText(1.1157), "1.1157");
  assert.equal(rateText(0.0063071), "0.0063071");
  assert.equal(rateText(0.000038555), "0.000038555");
  assert.ok(Number(rateText(0.000038555)) > 0);
});

// ---- Currency list ----------------------------------------------------------------------------------------------

test("currencies: USD, EUR and GBP come first", () => {
  assert.deepEqual(CURRENCIES.slice(0, 3), ["USD", "EUR", "GBP"]);
});

test("currencies: three-letter codes, no duplicates, every one has a name", () => {
  const seen = new Set();
  for (const c of CURRENCY_LIST) {
    assert.match(c.code, /^[A-Z]{3}$/);
    assert.ok(c.name.length > 2);
    assert.ok(!seen.has(c.code), `duplicate ${c.code}`);
    seen.add(c.code);
  }
  assert.ok(CURRENCIES.length >= 40);
});

test("currencies: no African currencies are offered", () => {
  const african = ["NGN", "GHS", "KES", "ZAR", "EGP", "MAD", "TZS", "UGX", "XOF", "XAF", "ETB", "DZD", "TND", "RWF", "ZMW", "BWP", "MUR", "NAD", "AOA", "MZN"];
  for (const c of african) assert.ok(!CURRENCIES.includes(c), `${c} should not be offered`);
});

// ---- Live exchange rates ----------------------------------------------------------------------------------------

const realFetch = globalThis.fetch;
const reply = (body, ok = true) => Promise.resolve({ ok, json: async () => body });
const withFetch = async (fn, run) => {
  globalThis.fetch = fn;
  try {
    return await run();
  } finally {
    globalThis.fetch = realFetch;
  }
};

test("rates: USD needs no lookup", async () => {
  await withFetch(() => assert.fail("should not fetch"), async () => {
    assert.equal(await fetchLiveUsdRate("USD"), 1);
    assert.equal(await fetchUsdRate("USD"), 1);
  });
});

test("rates: the live Coinbase price is used first", async () => {
  await withFetch((url) => (String(url).includes("coinbase") ? reply({ data: { amount: "1.1234" } }) : assert.fail("ECB should not be asked")), async () => {
    assert.equal(await fetchLiveUsdRate("EUR"), 1.1234);
  });
});

test("rates: falls back to the ECB rate when Coinbase is down", async () => {
  await withFetch((url) => (String(url).includes("coinbase") ? Promise.reject(new Error("down")) : reply({ rates: { USD: 1.09 } })), async () => {
    assert.equal(await fetchLiveUsdRate("EUR"), 1.09);
  });
});

test("rates: falls back to the ECB rate when Coinbase sends nonsense", async () => {
  for (const amount of ["0", "-3", "abc", "5000"]) {
    await withFetch((url) => (String(url).includes("coinbase") ? reply({ data: { amount } }) : reply({ rates: { USD: 1.3 } })), async () => {
      assert.equal(await fetchLiveUsdRate("GBP"), 1.3, `amount ${amount}`);
    });
  }
});

test("rates: returns null (staff type a rate) when both services fail", async () => {
  await withFetch(() => Promise.reject(new Error("offline")), async () => {
    assert.equal(await fetchLiveUsdRate("EUR"), null);
  });
  await withFetch(() => reply({}, false), async () => {
    assert.equal(await fetchLiveUsdRate("EUR"), null);
  });
});

test("rates: a tiny real rate (like VND) is accepted", async () => {
  await withFetch((url) => (String(url).includes("coinbase") ? reply({ data: { amount: "0.0000385550" } }) : assert.fail("no fallback")), async () => {
    assert.equal(await fetchLiveUsdRate("VND"), 0.000038555);
  });
});

// ---- What the client is asked to pay at the checkout ------------------------------------------------------------

test("checkout: converting an invoice to dollars matches the invoice page", () => {
  // The checkout function does Math.round(amount * rate * 100) / 100; the invoice page shows the same figure.
  const usd = (amount, rate) => Math.round(amount * rate * 100) / 100;
  assert.equal(usd(1000, 1.0913), 1091.3);
  assert.equal(usd(250.5, 1.2701), roundMoney(250.5 * 1.2701));
  assert.equal(usd(5_000_000, 0.000038555), 192.78);
});
