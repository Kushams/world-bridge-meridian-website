// Locates the module root, loads JSON config/schemas, and reads/writes datasets.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsvRecords, stringifyCsv } from "./csv.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

/** Load all non-secret configuration and derive lookup tables. */
export function loadConfig(root = ROOT) {
  const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  const pipelines = read("config/pipelines.json");
  const countries = read("config/countries.json");
  const dedupe = read("config/dedupe.json");
  const validation = read("config/validation.json");
  const output = read("config/output.json");

  const countryLookup = new Map();
  for (const c of countries.countries) {
    for (const n of [c.name, ...c.aliases]) countryLookup.set(n.toLowerCase().replace(/\./g, ""), c);
  }
  return {
    root,
    pipelines,
    countries,
    countryLookup,
    dedupe,
    validation,
    output,
    legalSuffixes: new Set(dedupe.companyLegalSuffixes),
    genericLocalParts: new Set(validation.genericEmailLocalParts),
    emailRegex: new RegExp(validation.emailPattern, "i"),
  };
}

export const DATASETS = {
  leads: { schema: "schemas/lead.schema.json", masterKey: "sourceOfTruth" },
  opportunities: { schema: "schemas/opportunity.schema.json", masterKey: "opportunitiesSourceOfTruth" },
};

/** Load a dataset descriptor: schema, ordered columns and the master file path. */
export function loadDataset(name, config) {
  const d = DATASETS[name];
  if (!d) throw new Error(`Unknown dataset "${name}". Expected one of: ${Object.keys(DATASETS).join(", ")}`);
  const schema = JSON.parse(fs.readFileSync(path.join(config.root, d.schema), "utf8"));
  return {
    name,
    schema,
    columns: schema.fields.map((f) => f.name),
    fieldByName: new Map(schema.fields.map((f) => [f.name, f])),
    masterPath: path.join(config.root, config.output[d.masterKey]),
  };
}

/** Read records from a CSV file that must match the schema header exactly. Missing file = empty dataset. */
export function readMaster(dataset) {
  if (!fs.existsSync(dataset.masterPath)) return [];
  const { header, records } = parseCsvRecords(fs.readFileSync(dataset.masterPath, "utf8"));
  if (header.length === 0) return [];
  if (header.join(",") !== dataset.columns.join(",")) {
    throw new Error(
      `${dataset.masterPath} header does not match ${dataset.schema.dataset} schema. ` +
        `Expected: ${dataset.columns.join(",")}\nFound: ${header.join(",")}`,
    );
  }
  return records;
}

/** Atomically write records as the master CSV (temp file + rename). */
export function writeMaster(dataset, records) {
  const tmp = `${dataset.masterPath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, stringifyCsv(dataset.columns, records));
  fs.renameSync(tmp, dataset.masterPath);
}

/** Read an incoming batch: .csv, .json (array or {records:[]}) or .jsonl. Returns plain objects. */
export function readIncoming(file) {
  const text = fs.readFileSync(file, "utf8");
  const ext = path.extname(file).toLowerCase();
  if (ext === ".csv") return parseCsvRecords(text).records;
  if (ext === ".jsonl") {
    return text
      .split(/\r?\n/)
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
  }
  if (ext === ".json") {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : (data.records ?? []);
  }
  throw new Error(`Unsupported incoming file type "${ext}" (use .csv, .json or .jsonl)`);
}

/** Tiny argv parser: --flag, --key value, --key=value; everything else is positional. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const [k, inline] = a.slice(2).split(/=(.*)/s);
    if (inline !== undefined) out[k] = inline;
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
    else out[k] = true;
  }
  return out;
}

export { loadJson };
