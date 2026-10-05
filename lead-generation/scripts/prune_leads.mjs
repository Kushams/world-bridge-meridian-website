#!/usr/bin/env node
// Remove records that match config/targeting.json (travel sellers) from the master. Writes a counts-only report.
//   node lead-generation/scripts/prune_leads.mjs [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadDataset, readMaster, writeMaster, parseArgs } from "./lib/config.mjs";
import { loadTargeting, outOfScopeReason } from "./lib/targeting.mjs";

const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const dataset = loadDataset("leads", config);
const targeting = loadTargeting(config.root);
const records = readMaster(dataset);
const keep = [];
const removed = new Map();
for (const r of records) {
  const why = outOfScopeReason(r, targeting);
  if (why) removed.set(r.pipeline, (removed.get(r.pipeline) ?? 0) + 1);
  else keep.push(r);
}
const total = records.length - keep.length;
console.log(`${total} of ${records.length} record(s) match the exclusion rules; ${keep.length} remain.`);
for (const [p, n] of removed) console.log(`  removed ${n} from ${p}`);
if (!args["dry-run"] && total > 0) {
  writeMaster(dataset, keep);
  const date = new Date().toISOString().slice(0, 10);
  const lines = [`# Prune ${date}`, "", `Removed ${total} travel-seller record(s) (config/targeting.json). Master now ${keep.length}.`, "", "| Pipeline | Removed |", "|---|---|", ...[...removed].map(([p, n]) => `| ${p} | ${n} |`), ""];
  fs.writeFileSync(path.join(config.root, config.output.reportsDir, `prune_${date}.md`), lines.join("\n"));
}
