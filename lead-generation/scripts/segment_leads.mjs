#!/usr/bin/env node
// Write DERIVED per-pipeline segment files from the master dataset into data/<segment dir>/.
// These files are regenerable and git-ignored; never edit them - edit master_leads.csv (via ingest) instead.
//
//   node lead-generation/scripts/segment_leads.mjs [--by-country]
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadDataset, readMaster, parseArgs } from "./lib/config.mjs";
import { stringifyCsv } from "./lib/csv.mjs";

const args = parseArgs(process.argv.slice(2));
const config = loadConfig();
const dataset = loadDataset("leads", config);
const records = readMaster(dataset);
const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unspecified";

let written = 0;
for (const [pipeline, def] of Object.entries(config.pipelines.pipelines)) {
  const dir = path.join(config.root, "data", def.dir);
  fs.mkdirSync(dir, { recursive: true });
  const prefix = pipeline.toLowerCase();
  // Remove only previously generated files for this pipeline.
  for (const f of fs.readdirSync(dir)) {
    if (f === `${prefix}.csv` || (f.startsWith(`${prefix}__`) && f.endsWith(".csv"))) fs.unlinkSync(path.join(dir, f));
  }
  const rows = records.filter((r) => r.pipeline === pipeline);
  if (rows.length === 0) continue;
  fs.writeFileSync(path.join(dir, `${prefix}.csv`), stringifyCsv(dataset.columns, rows));
  written++;
  if (args["by-country"]) {
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.country || "unspecified";
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r);
    }
    for (const [country, rs] of byCountry) {
      fs.writeFileSync(path.join(dir, `${prefix}__${slug(country)}.csv`), stringifyCsv(dataset.columns, rs));
      written++;
    }
  }
}
console.log(`Segmented ${records.length} lead(s) into ${written} derived file(s).`);
