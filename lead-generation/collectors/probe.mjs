#!/usr/bin/env node
// Collector: for each domain, fetch standard public contact pages and record the email addresses literally
// published there (mailto links, visible text, Cloudflare-obfuscated addresses decoded exactly as a browser would).
// It never guesses or constructs an address, never logs in, never submits forms and sends no email.
//
//   node lead-generation/collectors/probe.mjs domain1.com domain2.org ...     (or: --file domains.txt)
//
// Results are cached in data/incoming/probe_cache.jsonl (git-ignored); already-probed domains are skipped.
import fs from "node:fs";
import path from "node:path";
import { ROOT, parseArgs } from "../scripts/lib/config.mjs";

const UA = process.env.WBM_LEADGEN_USER_AGENT || "Mozilla/5.0 (compatible; WBM-research/1.0)";
const PATHS = ["/contact", "/contact-us", "/contact-us/", "/contact/", "/about", "/about-us", "/get-in-touch", "/enquiries", "/"];
const CACHE = path.join(ROOT, "data", "incoming", "probe_cache.jsonl");

const decodeCf = (h) => {
  const k = parseInt(h.slice(0, 2), 16);
  let o = "";
  for (let i = 2; i < h.length; i += 2) o += String.fromCharCode(parseInt(h.slice(i, i + 2), 16) ^ k);
  return o;
};

async function get(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    return r.ok ? { html: await r.text(), url: r.url } : null;
  } catch {
    return null;
  }
}

export function extractEmails(html) {
  const s = new Set();
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/g)) s.add(decodeCf(m[1]).toLowerCase());
  for (const m of html.matchAll(/mailto:([^"'?\s>]+)/gi)) s.add(decodeURIComponent(m[1]).toLowerCase());
  for (const m of html.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g)) s.add(m[0].toLowerCase());
  return [...s].filter((e) => !/\.(png|jpe?g|svg|webp|gif|css|js)$/.test(e) && !/(sentry|wixpress|example\.com|domain\.com|email\.com)/.test(e));
}

async function probe(domain) {
  const base = domain.startsWith("http") ? domain : `https://${domain}`;
  for (const p of PATHS) {
    const r = await get(base.replace(/\/$/, "") + p);
    if (!r) continue;
    const emails = extractEmails(r.html);
    if (emails.length) {
      const title = (r.html.match(/<title[^>]*>([^<]*)/i) || [])[1]?.replace(/\s+/g, " ").trim().slice(0, 80);
      return { key: domain, url: r.url, title, emails };
    }
  }
  return { key: domain, url: null, title: null, emails: [] };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = parseArgs(process.argv.slice(2));
  let domains = args._;
  if (args.file) domains = fs.readFileSync(args.file, "utf8").split(/\s+/).filter(Boolean);
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  const done = new Set(fs.existsSync(CACHE) ? fs.readFileSync(CACHE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).key) : []);
  const todo = [...new Set(domains)].filter((d) => !done.has(d));
  let i = 0;
  let hits = 0;
  await Promise.all(
    Array.from({ length: 5 }, async () => {
      while (i < todo.length) {
        const res = await probe(todo[i++]);
        if (res.emails.length) hits++;
        fs.appendFileSync(CACHE, JSON.stringify(res) + "\n");
      }
    }),
  );
  console.log(`probed ${todo.length} new domain(s) (${domains.length - todo.length} cached): ${hits} with published emails`);
}
