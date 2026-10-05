#!/usr/bin/env node
// Write COMPLETE batches of 500 master leads to data/batches/ (committed, frozen snapshots for the outreach team).
// Batch N holds master rows (N-1)*500+1 .. N*500. Existing batch files are never overwritten. A partial batch is
// not written (use --include-partial to preview it into exports/ instead).
//   node lead-generation/scripts/export_batches.mjs [--size 500]
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadDataset, readMaster, parseArgs } from "./lib/config.mjs";
import { stringifyCsv } from "./lib/csv.mjs";

const args = parseArgs(process.argv.slice(2));
const size = args.size ? Number(args.size) : 500;
const config = loadConfig();
const dataset = loadDataset("leads", config);
const records = readMaster(dataset);
const dir = path.join(config.root, "data", "batches");
fs.mkdirSync(dir, { recursive: true });
const complete = Math.floor(records.length / size);
const written = [];
for (let i = 0; i < complete; i++) {
  const name = `wbm_leads_batch_${String(i + 1).padStart(4, "0")}.csv`;
  const file = path.join(dir, name);
  const body = stringifyCsv(dataset.columns, records.slice(i * size, (i + 1) * size));
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, "utf8") !== body) console.warn(`WARNING: ${name} exists and differs from the master (rows changed after export); left untouched.`);
    continue;
  }
  fs.writeFileSync(file, body);
  written.push(name);
}
const pending = records.length - complete * size;
console.log(`${records.length} lead(s): ${complete} complete batch(es) of ${size}; ${written.length} new file(s) written${written.length ? ": " + written.join(", ") : ""}; ${pending} lead(s) waiting for the next batch.`);
