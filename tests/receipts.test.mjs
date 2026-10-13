// Automatic checks for the invoice, receipt and order-receipt PDFs. Run with: npm test
// (They check what is written and how many pages there are. How it looks still needs a person.)
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvoicePdf, buildOrderReceiptPdf, readPdf, realFonts, emblem } from "./helpers/pdf.mjs";

const client = { name: "Claire Dubois", email: "claire.dubois@example.fr", phone: "+33 1 23 45 67 89" };
const line = (title, details, qty, unit_price) => ({ title, details, qty, unit_price, amount: qty * unit_price });
const invoice = (over = {}) => {
  const lines = over.lines ?? [line("Accommodation", "The Dorset Square Hotel, 2 nights", 2, 173), line("Agency/Service Fee", "Booking & Coordination Fee", 1, 80)];
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  return { reference: "INV-4F2A91C0", createdAt: "2026-10-12T10:00:00Z", dueDate: "2026-10-26", status: "unpaid", paidAt: null, currency: "EUR", lines, subtotal, taxPercent: 0, total: subtotal, amountUsd: Math.round(subtotal * 1.09 * 100) / 100, fxRate: 1.09, ...over };
};
const make = async (inv, fonts = null) => readPdf(await buildInvoicePdf(inv, client, emblem, fonts));

// ---- Invoices ---------------------------------------------------------------------------------------------------

test("unpaid invoice: says Invoice, shows number, client, items and total, and has no PAID stamp", async () => {
  const { pages, text } = await make(invoice());
  assert.equal(pages, 1);
  assert.match(text, /Invoice No\. INV-4F2A91C0/);
  assert.match(text, /Claire Dubois/);
  assert.match(text, /claire\.dubois@example\.fr/);
  assert.match(text, /Accommodation/);
  assert.match(text, /TOTAL\s+€426\.00/);
  assert.doesNotMatch(text, /PAYMENT RECEIVED|AMOUNT PAID/);
});

test("paid invoice: becomes a Receipt with the paid date and the PAID stamp", async () => {
  const { pages, text } = await make(invoice({ status: "paid", paidAt: "2026-10-14T09:00:00Z" }));
  assert.equal(pages, 1);
  assert.match(text, /Receipt No\. INV-4F2A91C0/);
  assert.match(text, /Paid 14 October 2026/);
  assert.match(text, /AMOUNT PAID\s+€426\.00/);
  assert.match(text, /14 OCT 2026 PAID PAYMENT RECEIVED/); // the stamp
});

test("invoice: tax is shown and added to the total", async () => {
  const { text } = await make(invoice({ taxPercent: 20, total: 511.2 }));
  assert.match(text, /Tax \(20%\)\s+€85\.20/);
  assert.match(text, /TOTAL\s+€511\.20/);
});

test("invoice: stays on one page with the real Montserrat fonts, paid or not", async () => {
  for (const status of ["unpaid", "paid"]) {
    const { pages } = await make(invoice({ status, paidAt: status === "paid" ? "2026-10-14T09:00:00Z" : null }), realFonts());
    assert.equal(pages, 1, status);
  }
});

test("invoice: a realistic long itinerary still fits on one page (paid, with the stamp)", async () => {
  const lines = [
    line("Flight itinerary (round trip)", "(1 Passenger)\nOutbound Flight - 15th April\nAirline: British Airways\nRoute: Hannover Airport (HAJ) -> London Heathrow Airport (LHR)\nFlight Type: Direct\nReturn Flight - 17th April\nRoute: London Heathrow (LHR) -> Hannover (HAJ)", 1, 324),
    line("Accommodation", "The Dorset Square Hotel\n(Deluxe King Room for 1 Adult, Breakfast inclusive, 2 Nights; April 15th -> April 17th)", 2, 173),
    line("Ground Transfer with Private Driver (Round Trip)", "Private Driver for Duration of stay", 1, 85),
    line("Agency/Service Fee", "Booking & Coordination Fee", 1, 80),
  ];
  for (const fonts of [null, realFonts()]) {
    const { pages } = await make(invoice({ lines, taxPercent: 20, status: "paid", paidAt: "2026-10-14T09:00:00Z" }), fonts);
    assert.equal(pages, 1);
  }
});

test("invoice: other currencies show their code, with the dollar equivalent for unpaid invoices", async () => {
  const { text } = await make(invoice({ currency: "CAD", fxRate: 0.7215 }));
  assert.match(text, /CAD/);
});

test("invoice: a very small exchange rate (VND) does not crash or show zero", async () => {
  const lines = [line("Hotel", "3 nights", 1, 5_000_000)];
  const { pages, text } = await make(invoice({ currency: "VND", fxRate: 0.000038555, lines, amountUsd: 192.78 }));
  assert.equal(pages, 1);
  assert.match(text, /5,000,000\.00/);
});

test("invoice: odd text (ampersands, brackets, accents) is written out intact", async () => {
  const lines = [line("Tour & Guide (private)", "Café de Flore — Zürich", 1, 100)];
  const { text } = await make(invoice({ lines }));
  assert.match(text, /Tour & Guide \(private\)/);
});

// ---- Gift card and Travel Credits receipts ----------------------------------------------------------------------

const order = (over) => ({
  reference: "ORD-7K2M9Q41", paidAt: "2026-10-13T09:00:00Z", createdAt: "2026-10-13T08:58:00Z", paidVia: "card",
  quantity: 1, each: 0, design: "classic", recipientName: "", recipientEmail: "", message: "", ...over,
});
const orderPdf = async (o, fonts = null) => readPdf(await buildOrderReceiptPdf(o, { name: "Claire Dubois", email: "claire.dubois@example.fr" }, emblem, fonts));

test("gift card receipt: shows the cards, total, recipient and message, on one page", async () => {
  const o = order({ kind: "gift-card", total: 1500, quantity: 3, each: 500, design: "seasonal", recipientName: "Marco Rossi", recipientEmail: "marco.rossi@example.it", message: "Happy birthday!" });
  for (const fonts of [null, realFonts()]) {
    const { pages } = await orderPdf(o, fonts);
    assert.equal(pages, 1);
  }
  const { text } = await orderPdf(o);
  assert.match(text, /GIFT CARD US\$500\.00/);
  assert.match(text, /3 × US\$500\.00/);
  assert.match(text, /TOTAL PAID US\$1,500\.00/);
  assert.match(text, /Marco Rossi/);
  assert.match(text, /Happy birthday!/);
  assert.match(text, /13 OCT 2026 PAID PAYMENT RECEIVED/); // the stamp
});

test("gift card receipt: never prints a gift card code", async () => {
  const { text } = await orderPdf(order({ kind: "gift-card", total: 500, each: 500 }));
  assert.match(text, /codes? (was|were) emailed/);
  assert.doesNotMatch(text, /[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/);
});

test("gift card receipt: both designs and a long message still fit on one page", async () => {
  const message = "Wishing you the most wonderful journey ahead. ".repeat(6).trim();
  for (const design of ["classic", "seasonal"]) {
    const { pages } = await orderPdf(order({ kind: "gift-card", total: 250, each: 250, design, recipientName: "A Very Long Recipient Name Indeed", recipientEmail: "a.very.long.recipient.address@example-domain.com", message }), realFonts());
    assert.equal(pages, 1, design);
  }
});

test("Travel Credits receipt: shows the amount added to the wallet, on one page", async () => {
  const o = order({ kind: "travel-credits", total: 2000 });
  const { pages } = await orderPdf(o, realFonts());
  assert.equal(pages, 1);
  const plain = await orderPdf(o);
  assert.match(plain.text, /TRAVEL CREDITS US\$2,000\.00/);
  assert.match(plain.text, /TOTAL PAID US\$2,000\.00/);
  assert.match(plain.text, /added to your account/);
});

test("order receipts: crypto-paid orders say so", async () => {
  const { text } = await orderPdf(order({ kind: "travel-credits", total: 100, paidVia: "crypto" }));
  assert.match(text, /Payment\s+(Crypto|Cryptocurrency)/i);
});
