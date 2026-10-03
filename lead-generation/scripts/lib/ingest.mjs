// Ingest pipeline: normalise -> validate -> deduplicate -> append -> report.
// Pure with respect to I/O except for the optional write at the end, so it can be unit tested.
import fs from "node:fs";
import path from "node:path";
import { loadDataset, readMaster, writeMaster, readIncoming } from "./config.mjs";
import { normalizeLead, normalizeOpportunity, makeId, oppKey, readyForOutreach, leadKeys } from "./normalize.mjs";
import { validateLead, validateOpportunity } from "./validate.mjs";
import { LeadIndex, mergeInto } from "./dedupe.mjs";
import { tally, missingRates, coverageGaps, KEY_FIELDS, renderRunReport } from "./report.mjs";

const bump = (m, k, n = 1) => m.set(k, (m.get(k) ?? 0) + n);
const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

/**
 * Run an ingest.
 * @param {object} opts { config, datasetName, records, inputLabel, today, dryRun, ignoreUnknown }
 * @returns {{ report: object, master: object[], rejected: object[] }}
 */
export function runIngest({ config, datasetName = "leads", records, inputLabel = "(memory)", today, dryRun = false, ignoreUnknown = false, runId }) {
  const dataset = loadDataset(datasetName, config);
  const master = readMaster(dataset);
  const problems = [];

  const unknown = new Set();
  for (const raw of records) for (const k of Object.keys(raw)) if (!dataset.fieldByName.has(k)) unknown.add(k);
  if (unknown.size > 0) {
    const msg = `unknown field(s) in input: ${[...unknown].join(", ")}`;
    if (!ignoreUnknown) throw new Error(`${msg}. Fix the batch or pass --ignore-unknown.`);
    problems.push(`${msg} (ignored)`);
  }

  const isLeads = datasetName === "leads";
  const index = isLeads ? new LeadIndex(master, config) : null;
  const oppKeys = new Map();
  if (!isLeads) for (const r of master) oppKeys.set(oppKey(r), r);
  const ids = new Set(master.map((r) => r.lead_id ?? r.opportunity_id));

  const added = [];
  const rejected = [];
  const stats = { duplicates: 0, enriched: 0, conflicts: 0, invalid: 0, outOfScope: 0 };
  const issueCodes = new Map();
  const sourceCounts = new Map();

  records.forEach((raw, i) => {
    const row = i + 1;
    const rec = isLeads ? normalizeLead(raw, dataset, config) : normalizeOpportunity(raw, dataset, config);
    bump(sourceCounts, rec.source_type || "(blank)");

    if (isLeads && rec.lead_status === "OUT_OF_SCOPE") {
      stats.outOfScope++;
      rejected.push({ row, reason: "OUT_OF_SCOPE", raw });
      return;
    }

    const issues = isLeads ? validateLead(rec, dataset, config, { today, preAssign: true }) : validateOpportunity(rec, dataset, config, { preAssign: true });
    for (const it of issues) bump(issueCodes, `${it.level}:${it.code}`);
    const errors = issues.filter((x) => x.level === "error");
    if (errors.length > 0) {
      stats.invalid++;
      rejected.push({ row, reason: "INVALID", issues: errors, raw });
      return;
    }

    if (!isLeads) {
      const k = oppKey(rec);
      if (oppKeys.has(k)) {
        stats.duplicates++;
        return;
      }
      rec.opportunity_id = makeId("OPP-", k, ids);
      ids.add(rec.opportunity_id);
      oppKeys.set(k, rec);
      added.push(rec);
      return;
    }

    const hit = index.find(rec);
    if (hit) {
      stats.duplicates++;
      const { filled, conflicts } = mergeInto(hit.record, rec, config, today);
      if (filled.length > 0) stats.enriched++;
      stats.conflicts += conflicts.length;
      index.add(hit.record);
      return;
    }

    rec.lead_id = makeId(config.dedupe.idPrefix, rec.duplicate_key || JSON.stringify(rec), ids);
    ids.add(rec.lead_id);
    const sibling = index.sameOrg(rec);
    if (sibling && !rec.existing_match) rec.existing_match = sibling.lead_id;
    rec.lead_status = readyForOutreach({ ...rec, lead_status: "DISCOVERED" }, config) ? "READY_FOR_OUTREACH" : "DISCOVERED";
    rec.last_updated = today;
    index.add(rec);
    added.push(rec);
  });

  const newMaster = [...master, ...added];
  const countsOf = (field) => sorted(new Map(tally(added, field)));
  const report = {
    runId,
    date: today,
    dataset: datasetName,
    input: inputLabel,
    dryRun,
    discovered: records.length,
    added: added.length,
    ...stats,
    withEmail: added.filter((r) => r.email).length,
    withoutEmail: added.filter((r) => !r.email).length,
    masterAfter: newMaster.length,
    countries: countsOf("country"),
    pipelines: countsOf("pipeline"),
    campaigns: countsOf("campaign"),
    intents: countsOf("intent_class"),
    sources: sorted(sourceCounts),
    issueCodes: sorted(issueCodes),
    gaps: isLeads ? coverageGaps(newMaster, config) : { primaryWithNone: [], pipelinesWithNone: [] },
    missing: isLeads ? missingRates(added, KEY_FIELDS) : [],
    problems,
  };

  if (!dryRun) {
    writeMaster(dataset, newMaster);
    const rep = path.join(config.root, config.output.reportsDir);
    fs.mkdirSync(rep, { recursive: true });
    fs.writeFileSync(path.join(rep, `run_${runId}.md`), renderRunReport(report));
    fs.writeFileSync(path.join(rep, `run_${runId}.json`), JSON.stringify(report, null, 2) + "\n");
    if (rejected.length > 0) {
      const inc = path.join(config.root, config.output.incomingDir);
      fs.mkdirSync(inc, { recursive: true });
      fs.writeFileSync(path.join(inc, `rejected_${runId}.json`), JSON.stringify(rejected, null, 2) + "\n");
    }
  }
  return { report, master: newMaster, rejected };
}

export function ingestFile(config, file, opts = {}) {
  const records = readIncoming(file);
  const now = new Date();
  const runId = opts.runId ?? now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "_");
  return runIngest({
    config,
    records,
    inputLabel: path.relative(config.root, path.resolve(file)),
    today: opts.today ?? now.toISOString().slice(0, 10),
    runId,
    ...opts,
  });
}

export { leadKeys };
