#!/usr/bin/env node
// Export (a filtered view of) the master dataset to CSV / Excel-ready CSV / JSON / JSONL in exports/.
// Exports are DERIVED from master_leads.csv and git-ignored. They are for the separate WBM outreach team; this tool sends nothing.
//
//   node lead-generation/scripts/export_leads.mjs [--format csv|excel|json|jsonl]
//        [--pipeline B2C_BROAD] [--country UK] [--status READY_FOR_OUTREACH] [--intent TRAVEL_INTENT]
//        [--campaign "B2C Broad | USA | Broad Prospect"] [--has-email] [--out exports/name.ext]
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadDataset, readMaster, parseArgs } from "./lib/config.mjs";
import { stringifyCsv } from "./lib/csv.mjs";
import { canonicalCountry } from "./lib/normalize.mjs";

const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const dataset = loadDataset("leads", config);
const format = args.format ?? "csv";
if (!(format in config.output.exportFormats)) {
  console.error(`unknown --format "${format}". Use one of: ${Object.keys(config.output.exportFormats).join(", ")}`);
  process.exit(2);
}

let records = readMaster(dataset);
if (args.pipeline) records = records.filter((r) => r.pipeline === String(args.pipeline).toUpperCase());
if (args.country) {
  const c = canonicalCountry(args.country, config).name;
  records = records.filter((r) => r.country === c);
}
if (args.status) records = records.filter((r) => r.lead_status === String(args.status).toUpperCase());
if (args.intent) records = records.filter((r) => r.intent_class === String(args.intent).toUpperCase());
if (args.campaign) records = records.filter((r) => r.campaign === args.campaign);
if (args["has-email"]) records = records.filter((r) => r.email);

const ext = { csv: "csv", excel: "csv", json: "json", jsonl: "jsonl" }[format];
const stamp = new Date().toISOString().slice(0, 10);
const out = path.resolve(args.out ?? path.join(config.root, config.output.exportsDir, `leads_${stamp}${format === "excel" ? "_excel" : ""}.${ext}`));
fs.mkdirSync(path.dirname(out), { recursive: true });

let body;
if (format === "json") body = JSON.stringify(records, null, 2) + "\n";
else if (format === "jsonl") body = records.map((r) => JSON.stringify(r)).join("\n") + (records.length ? "\n" : "");
else body = stringifyCsv(dataset.columns, records, { sanitize: format === "excel", bom: format === "excel" });

fs.writeFileSync(out, body);
console.log(`Exported ${records.length} lead(s) as ${format} to ${path.relative(process.cwd(), out)}`);
