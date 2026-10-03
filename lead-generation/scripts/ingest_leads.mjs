#!/usr/bin/env node
// Normalise, validate, deduplicate and append a staged batch to the master dataset, then write a run report.
//
//   node lead-generation/scripts/ingest_leads.mjs <batch.csv|.json|.jsonl> [--dataset leads|opportunities] [--dry-run] [--ignore-unknown]
//
// Existing master records are never deleted or overwritten: duplicates only fill blank fields (see config/dedupe.json).
import { loadConfig, parseArgs } from "./lib/config.mjs";
import { ingestFile } from "./lib/ingest.mjs";
import { renderRunReport } from "./lib/report.mjs";

const args = parseArgs(process.argv.slice(2));
const file = args._[0];
if (!file) {
  console.error("usage: ingest_leads.mjs <batch.csv|.json|.jsonl> [--dataset leads|opportunities] [--dry-run] [--ignore-unknown]");
  process.exit(2);
}

try {
  const config = loadConfig();
  const { report, rejected } = ingestFile(config, file, {
    datasetName: args.dataset ?? "leads",
    dryRun: Boolean(args["dry-run"]),
    ignoreUnknown: Boolean(args["ignore-unknown"]),
  });
  console.log(renderRunReport(report));
  if (rejected.length > 0 && !args["dry-run"]) {
    console.log(`${rejected.length} record(s) were not added; details: data/incoming/rejected_${report.runId}.json (git-ignored).`);
  }
} catch (e) {
  console.error(`ingest failed: ${e.message}`);
  process.exit(1);
}
