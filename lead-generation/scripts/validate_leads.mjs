#!/usr/bin/env node
// Validate the master dataset (or another CSV of the same schema) against the schema and cross-field rules.
//
//   node lead-generation/scripts/validate_leads.mjs [--dataset leads|opportunities] [--file path.csv] [--strict]
//
// Exit code 1 if any error is found (or any warning with --strict).
import fs from "node:fs";
import { loadConfig, loadDataset, readMaster, parseArgs } from "./lib/config.mjs";
import { parseCsvRecords } from "./lib/csv.mjs";
import { validateLead, validateOpportunity, validateMasterIntegrity } from "./lib/validate.mjs";

const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const dataset = loadDataset(args.dataset ?? "leads", config);
const today = new Date().toISOString().slice(0, 10);

let records;
try {
  if (args.file) {
    const { header, records: recs } = parseCsvRecords(fs.readFileSync(args.file, "utf8"));
    if (header.join(",") !== dataset.columns.join(",")) throw new Error(`header of ${args.file} does not match the ${dataset.name} schema`);
    records = recs;
  } else {
    records = readMaster(dataset);
  }
} catch (e) {
  console.error(`validation failed: ${e.message}`);
  process.exit(1);
}

const all = validateMasterIntegrity(records, dataset);
records.forEach((rec, i) => {
  const issues = dataset.name === "leads" ? validateLead(rec, dataset, config, { today }) : validateOpportunity(rec, dataset, config);
  for (const it of issues) all.push({ ...it, row: i + 2 });
});

const errors = all.filter((x) => x.level === "error");
const warns = all.filter((x) => x.level === "warn");
for (const it of all) console.log(`${it.level.toUpperCase()} row ${it.row} [${it.code}] ${it.field}: ${it.message}`);
console.log(`\n${dataset.name}: ${records.length} record(s), ${errors.length} error(s), ${warns.length} warning(s).`);
process.exit(errors.length > 0 || (args.strict && warns.length > 0) ? 1 : 0);
