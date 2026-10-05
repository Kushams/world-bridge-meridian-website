#!/usr/bin/env node
// Turn probe results + seed metadata into an ingest-ready batch (data/incoming/batch_<date>.json).
// Only domains with a seed row in lead-generation/seeds/*.txt are used; the seed row supplies what a page cannot
// (company name, city, country, pipeline). One record per organisation, using a strict allow-list of GENERIC
// business inbox names (info@, groups@, events@, ...). Named personal addresses are never selected here.
//
// Seed row format (pipe separated):  domain|Company|City|Country|PIPELINE|organisation type|potential use case
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../scripts/lib/config.mjs";

const SEEDS = path.join(ROOT, "seeds");
const CACHE = path.join(ROOT, "data", "incoming", "probe_cache.jsonl");
const date = process.env.WBM_DATE || new Date().toISOString().slice(0, 10);

const meta = new Map();
for (const f of fs.readdirSync(SEEDS).filter((x) => x.endsWith(".txt")).sort()) {
  for (const l of fs.readFileSync(path.join(SEEDS, f), "utf8").split("\n")) {
    const p = l.split("|");
    if (p.length >= 7 && !l.startsWith("#")) meta.set(p[0], { company: p[1], city: p[2], country: p[3], pipeline: p[4], orgType: p[5], use: p[6], altDomains: (p[7] || "").split(",").filter(Boolean) });
  }
}
const results = fs.existsSync(CACHE) ? fs.readFileSync(CACHE, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse) : [];

// Priority: group sales > corporate/partnership > events/hospitality > VIP > general enquiries. Ticketing, membership,
// press and named-person inboxes are deliberately excluded.
const PRI = [
  /^groups?$|^groupsales$|^groupbookings$/,
  /^corporate|^partnerships?$|^partners$|^business/,
  /^events?$|^specialevents$|^hospitality$|^privateevents$/,
  /^vip$/,
  /^(info|hello|enquiries|enquiry|inquiries|inquiry|contact|contactus|ask|information|explore|tours|travel|sales|concierge|office|mail)$/,
];
const clean = (e) => e.replace(/^mailto:/, "").replace(/^u003[ec]/, "").replace(/[\\"';,)>].*$/, "").toLowerCase();

const out = [];
const seen = new Set();
for (const r of results) {
  const m = meta.get(r.key);
  if (!m || seen.has(r.key)) continue;
  const host = r.key.replace(/^www\./, "");
  const emails = [...new Set(r.emails.map(clean))];
  let pick = null;
  for (const re of PRI) {
    pick = emails.find((e) => {
      const [l, d] = e.split("@");
      return re.test(l) && (d === host || d.endsWith("." + host) || host.endsWith("." + d) || m.altDomains.includes(d));
    });
    if (pick) break;
  }
  if (!pick) continue;
  seen.add(r.key);
  const local = pick.split("@")[0];
  const strong = /^(groups?|groupsales|corporate.*|partnerships?|vip)$/.test(local);
  out.push({
    lead_type: "ORGANIZATION", company: m.company, website: `https://${host}`, email: pick, email_type: "GENERAL_BUSINESS",
    organization_type: m.orgType, city: m.city, country: m.country, pipeline: m.pipeline, potential_use_case: m.use,
    relevance: strong ? "MEDIUM_RELEVANCE" : "BROAD_PROSPECT",
    intent_class: ["TRAVEL_INDUSTRY", "STRATEGIC_PARTNERS", "CONCIERGE_LUXURY"].includes(m.pipeline) ? "PARTNERSHIP_OPPORTUNITY" : "BROAD_PROSPECT",
    source_url: r.url, source_type: m.pipeline === "ARTS_CULTURE" ? "cultural_organization_website" : "company_website",
    discovery_date: date, discovery_method: "official website contact-page review",
    evidence: `General business address ${local}@ published verbatim on the organisation's own contact page (${r.url}).`,
  });
}
const file = path.join(ROOT, "data", "incoming", `batch_${date}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`${meta.size} seed rows, ${results.length} probed, ${out.length} usable organisation records -> ${path.relative(process.cwd(), file)}`);
