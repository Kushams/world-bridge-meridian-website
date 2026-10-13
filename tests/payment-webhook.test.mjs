// Automatic checks for how we read ePayVista's "order paid" messages. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { hmacHex, safeEqual, signatureValid, isOrderClosed, amountAsked, isDoublePayment, judgePayment, needsFulfilment } from "../supabase/functions/_shared/pay-rules.ts";

const SECRET = "test-secret-not-real";
const body = (o) => new TextEncoder().encode(JSON.stringify(o));
const sign = (raw) => createHmac("sha256", SECRET).update(raw).digest("hex");

// ---- Is the message genuinely from ePayVista? -------------------------------------------------------------------

test("signature: our HMAC matches a standard SHA-256 HMAC", async () => {
  const raw = body({ reference_id: "abc", status: "CLOSED" });
  assert.equal(await hmacHex(SECRET, raw), sign(raw));
});

test("signature: a genuine message is accepted (upper or lower case header)", async () => {
  const raw = body({ reference_id: "abc", status: "CLOSED" });
  assert.equal(await signatureValid(SECRET, raw, sign(raw)), true);
  assert.equal(await signatureValid(SECRET, raw, sign(raw).toUpperCase()), true);
});

test("signature: missing, empty or wrong signatures are rejected", async () => {
  const raw = body({ reference_id: "abc", status: "CLOSED" });
  assert.equal(await signatureValid(SECRET, raw, null), false);
  assert.equal(await signatureValid(SECRET, raw, ""), false);
  assert.equal(await signatureValid(SECRET, raw, "deadbeef"), false);
  assert.equal(await signatureValid(SECRET, raw, sign(raw).slice(0, -1) + "0"), false);
});

test("signature: a message changed after signing is rejected (e.g. a forged amount or reference)", async () => {
  const good = body({ reference_id: "abc", status: "CLOSED" });
  const forged = body({ reference_id: "xyz", status: "CLOSED" });
  assert.equal(await signatureValid(SECRET, forged, sign(good)), false);
});

test("signature: signed with a different secret is rejected", async () => {
  const raw = body({ reference_id: "abc", status: "CLOSED" });
  const other = createHmac("sha256", "someone-elses-secret").update(raw).digest("hex");
  assert.equal(await signatureValid(SECRET, raw, other), false);
});

test("safeEqual: only identical strings match", () => {
  assert.equal(safeEqual("abc", "abc"), true);
  assert.equal(safeEqual("abc", "abd"), false);
  assert.equal(safeEqual("abc", "abcd"), false);
  assert.equal(safeEqual("", ""), true);
});

// ---- Is this a finished order? ----------------------------------------------------------------------------------

test("message: only a CLOSED message with a reference counts", () => {
  assert.equal(isOrderClosed({ reference_id: "r1", status: "CLOSED" }), true);
  assert.equal(isOrderClosed({ reference_id: "r1", status: "OPEN" }), false);
  assert.equal(isOrderClosed({ reference_id: "r1", status: "closed" }), false);
  assert.equal(isOrderClosed({ status: "CLOSED" }), false);
  assert.equal(isOrderClosed({ reference_id: "", status: "CLOSED" }), false);
  assert.equal(isOrderClosed({}), false);
});

// ---- What amount should have been paid? -------------------------------------------------------------------------

test("amount: the checkout's own amount wins over the invoice's latest amount (old checkout paid late)", () => {
  assert.equal(amountAsked({ amount_usd: 1091.3 }, { amount_usd: 1100.05 }), 1091.3);
});

test("amount: with no saved checkout, the invoice's amount is used", () => {
  assert.equal(amountAsked(null, { amount_usd: 500 }), 500);
});

test("amount: numbers that arrive as text from the database still compare correctly", () => {
  assert.equal(amountAsked({ amount_usd: "250.00" }, { amount_usd: "999" }), 250);
});

// ---- Paid, or does a person need to check? ----------------------------------------------------------------------

test("verdict: filled for exactly the amount asked is paid", () => {
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "1091.30" }, 1091.3), "paid");
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "500" }, 500), "paid");
});

test("verdict: the wrong amount needs checking, even if filled (underpaid or overpaid)", () => {
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "499.99" }, 500), "needs_review");
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "500.01" }, 500), "needs_review");
});

test("verdict: any state other than FILLED needs checking", () => {
  for (const paymentState of ["PENDING", "PARTIAL", "EXPIRED", "CANCELLED", "filled", undefined]) {
    assert.equal(judgePayment({ paymentState, amountInUSD: "500" }, 500), "needs_review", String(paymentState));
  }
});

test("verdict: a missing or junk amount from the provider needs checking, never paid", () => {
  assert.equal(judgePayment({ paymentState: "FILLED" }, 500), "needs_review");
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "abc" }, 500), "needs_review");
  assert.equal(judgePayment({ paymentState: "FILLED", amountInUSD: "" }, 500), "needs_review");
});

// ---- Retries and double payments --------------------------------------------------------------------------------

test("double payment: the same transaction arriving again is only a retry", () => {
  assert.equal(isDoublePayment("0xabc", "0xabc"), false);
});

test("double payment: a different transaction on a paid invoice is flagged for refund", () => {
  assert.equal(isDoublePayment("0xabc", "0xdef"), true);
});

test("double payment: no transaction id means we can't call it a double", () => {
  assert.equal(isDoublePayment("0xabc", ""), false);
  assert.equal(isDoublePayment("0xabc", undefined), false);
  assert.equal(isDoublePayment(null, "0xdef"), false);
  assert.equal(isDoublePayment(undefined, "0xdef"), false);
});

// ---- Gift cards and Travel Credits ------------------------------------------------------------------------------

test("fulfilment: paid gift cards and Travel Credits are fulfilled automatically", () => {
  assert.equal(needsFulfilment("paid", "gift-card", "a@b.com"), true);
  assert.equal(needsFulfilment("paid", "travel-credits", "a@b.com"), true);
});

test("fulfilment: ordinary invoices, unpaid orders and orders with no client email are not", () => {
  assert.equal(needsFulfilment("paid", "invoice", "a@b.com"), false);
  assert.equal(needsFulfilment("needs_review", "gift-card", "a@b.com"), false);
  assert.equal(needsFulfilment("paid", "gift-card", undefined), false);
  assert.equal(needsFulfilment("paid", "travel-credits", ""), false);
});
