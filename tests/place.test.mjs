// Place lines never say a city twice. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { uniquePlace, venueLine } from "../src/lib/place.ts";

test("a city already in the venue's name is not repeated", () => {
  assert.equal(venueLine("Pace Gallery, London", "London", "United Kingdom"), "Pace Gallery, London · United Kingdom");
});

test("a venue without its city in the name gets the city and country", () => {
  assert.equal(venueLine("Tate Modern", "London", "United Kingdom"), "Tate Modern · London, United Kingdom");
});

test("a city that is also the country is said once", () => {
  assert.equal(venueLine("David Zwirner", "Hong Kong", "Hong Kong"), "David Zwirner · Hong Kong");
});

test("addresses that already end in the city are not repeated", () => {
  assert.equal(uniquePlace(["5 Hanover Square, London", "London", "United Kingdom"]), "5 Hanover Square, London, United Kingdom");
  assert.equal(uniquePlace([undefined, "Paris", "France"]), "Paris, France");
  assert.equal(uniquePlace(["", null]), "");
});

test("every venue on the site reads cleanly, with no repeated place in its line", () => {
  const src = fs.readFileSync(new URL("../src/data/exhibitions.ts", import.meta.url), "utf8");
  const rows = [...src.matchAll(/venue: "([^"]+)",\s*city: "([^"]+)",\s*country: "([^"]+)"/g)];
  assert.ok(rows.length >= 100, `found ${rows.length}`);
  for (const [, venue, city, country] of rows) {
    const line = venueLine(venue, city, country);
    const parts = line.split(/ · |, /).map((x) => x.toLowerCase());
    assert.equal(new Set(parts).size, parts.length, `repeated place in: ${line}`);
  }
});
