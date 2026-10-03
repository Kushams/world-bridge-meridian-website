#!/usr/bin/env node
// Generate a summary of the whole master dataset: totals, pipelines, geography, intent,
// source performance, missing fields and coverage gaps. Writes reports/master_summary_<date>.md (and prints it).
//
//   node lead-generation/scripts/generate_report.mjs [--print-only]
//
// Per-run reports are written automatically by ingest_leads.mjs (reports/run_*.md).
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadDataset, readMaster, parseArgs } from "./lib/config.mjs";
import { buildMasterSummary, renderMasterSummary } from "./lib/report.mjs";

const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const records = readMaster(loadDataset("leads", config));
const today = new Date().toISOString().slice(0, 10);
const md = renderMasterSummary(buildMasterSummary(records, config, today));
console.log(md);
if (!args["print-only"]) {
  const file = path.join(config.root, config.output.reportsDir, `master_summary_${today}.md`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, md);
  console.log(`Wrote ${path.relative(process.cwd(), file)}`);
}
