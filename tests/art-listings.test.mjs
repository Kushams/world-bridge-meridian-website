// Every exhibition, museum show and art fair has its own page. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync(new URL("../src/data/exhibitions.ts", import.meta.url), "utf8");
const listings = [...src.matchAll(/slug: "([^"]+)",\s*category: "(gallery|museum|fair)"/g)].map((m) => ({ slug: m[1], category: m[2] }));

test("every listing is found (so every one gets a page)", () => {
  assert.ok(listings.length >= 100, `found ${listings.length}`);
});

test("slugs are unique within each section, so no two pages clash", () => {
  const seen = new Set();
  for (const l of listings) {
    const key = `${l.category}/${l.slug}`;
    assert.ok(!seen.has(key), `duplicate ${key}`);
    seen.add(key);
  }
});

test("slugs are safe for a web address", () => {
  for (const l of listings) assert.match(l.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, l.slug);
});

test("the three sections have the pages that the links point to", () => {
  for (const [dir] of [["exhibitions"], ["museums"], ["art-fairs"]]) {
    assert.ok(fs.existsSync(new URL(`../src/app/${dir}/[slug]/page.tsx`, import.meta.url)), dir);
  }
});
