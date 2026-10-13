// Which staff member's link brought a visitor here? Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { referralCodeFromSearch } from "../src/lib/referral.ts";

test("a personal link code is read from ?from=", () => {
  assert.equal(referralCodeFromSearch("?from=ravi"), "ravi");
  assert.equal(referralCodeFromSearch("?from=Youssef"), "youssef");
});

test("?ref= works too, and wins when both are present", () => {
  assert.equal(referralCodeFromSearch("?ref=ravi"), "ravi");
  assert.equal(referralCodeFromSearch("?ref=ravi&from=2026-10-13"), "ravi");
});

test("an exhibition start date in ?from= is never taken for a code", () => {
  assert.equal(referralCodeFromSearch("?event=Show&type=gallery&from=2026-10-13&to=2026-11-14"), null);
});

test("the exhibition link still carries the staff code through ?ref=", () => {
  assert.equal(referralCodeFromSearch("?ref=ravi&event=Show&type=gallery&from=2026-10-13&to=2026-11-14"), "ravi");
});

test("empty, missing or odd values give no code", () => {
  assert.equal(referralCodeFromSearch(""), null);
  assert.equal(referralCodeFromSearch("?from="), null);
  assert.equal(referralCodeFromSearch("?from=a"), null);
  assert.equal(referralCodeFromSearch("?from=has space"), null);
  assert.equal(referralCodeFromSearch("?from=" + "x".repeat(31)), null);
  assert.equal(referralCodeFromSearch("?from=<script>"), null);
});
