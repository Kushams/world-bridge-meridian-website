// Run with: node --test lead-generation/scripts/tests/
// All fixtures are synthetic, built in memory / a temp directory, and never written into the repo.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, parseCsvRecords, stringifyCsv, sanitizeForSpreadsheet } from "../lib/csv.mjs";
import { loadConfig, loadDataset, readMaster, ROOT } from "../lib/config.mjs";
import { normalizeLead, leadKeys, normCompany } from "../lib/normalize.mjs";
import { validateLead } from "../lib/validate.mjs";
import { runIngest } from "../lib/ingest.mjs";
import { execFileSync } from "node:child_process";

const config = loadConfig();
const dataset = loadDataset("leads", config);
const TODAY = "2026-10-03";

/** A temp module root with the real config + schemas and empty data dirs. */
function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wbm-leadgen-test-"));
  for (const d of ["config", "schemas"]) fs.cpSync(path.join(ROOT, d), path.join(root, d), { recursive: true });
  for (const d of ["data/master", "data/seasonal", "data/incoming", "reports"]) fs.mkdirSync(path.join(root, d), { recursive: true });
  const cfg = loadConfig(root);
  for (const n of ["leads", "opportunities"]) {
    const ds = loadDataset(n, cfg);
    fs.writeFileSync(ds.masterPath, stringifyCsv(ds.columns, []));
  }
  return cfg;
}

const person = (over = {}) => ({
  lead_type: "PERSON",
  first_name: "Test",
  last_name: "Person",
  email: "test.person@example.com",
  company: "Test Travel Co",
  pipeline: "TRAVEL_INDUSTRY",
  country: "United Kingdom",
  source_url: "https://example.com/team",
  source_type: "company_website",
  discovery_date: "2026-10-01",
  discovery_method: "unit test",
  evidence: "listed on team page",
  ...over,
});

test("csv round-trips quotes, commas, newlines and BOM", () => {
  const header = ["a", "b"];
  const recs = [{ a: 'he said "hi", ok', b: "line1\nline2" }, { a: "", b: "x" }];
  const text = stringifyCsv(header, recs, { bom: true });
  assert.equal(parseCsvRecords(text).records.length, 2);
  assert.deepEqual(parseCsvRecords(text).records, recs);
  assert.deepEqual(parseCsv("a,b\r\n1,2\r\n"), [["a", "b"], ["1", "2"]]);
});

test("spreadsheet sanitiser blocks formulas but keeps phone numbers", () => {
  assert.equal(sanitizeForSpreadsheet("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(sanitizeForSpreadsheet("@cmd"), "'@cmd");
  assert.equal(sanitizeForSpreadsheet("+1 212 555 0100"), "+1 212 555 0100");
  assert.equal(sanitizeForSpreadsheet("-cmd"), "'-cmd");
});

test("committed master datasets are empty header-only files matching the schema", () => {
  assert.deepEqual(readMaster(dataset), []);
  assert.deepEqual(readMaster(loadDataset("opportunities", config)), []);
  assert.equal(new Set(dataset.columns).size, dataset.columns.length);
  for (const required of ["first_name", "email", "company", "pipeline", "intent_type", "destination_interest", "duplicate_key", "lead_status", "source_url", "evidence"]) {
    assert.ok(dataset.columns.includes(required), `schema is missing ${required}`);
  }
});

test("every pipeline directory exists and countries normalise", () => {
  for (const p of Object.values(config.pipelines.pipelines)) assert.ok(fs.existsSync(path.join(ROOT, "data", p.dir)), p.dir);
  assert.equal(normalizeLead(person({ country: "United States" }), dataset, config).country, "USA");
  assert.equal(normalizeLead(person({ country: "U.K." }), dataset, config).country, "UK");
  const n = normalizeLead(person({ country: "Deutschland" }), dataset, config);
  assert.equal(n.country, "Germany");
  assert.equal(n.region, "Europe");
});

test("normalisation derives only what rules allow and never guesses email", () => {
  const n = normalizeLead(person({ email: "", first_name: "", last_name: "", full_name: "Test Person" }), dataset, config);
  assert.equal(n.email, "");
  assert.equal(n.first_name, "");
  assert.equal(n.customer_type, "Travel Industry");
  assert.equal(n.intent_type, "None Identified");
  assert.equal(n.intent_class, "BROAD_PROSPECT");
  assert.equal(n.campaign, "Travel Industry | UK | Broad Prospect");
  assert.equal(normalizeLead(person({ email: "INFO@Example.com", lead_type: "ORGANIZATION" }), dataset, config).email_type, "GENERAL_BUSINESS");
});

test("company normalisation ignores legal suffixes and punctuation", () => {
  assert.equal(normCompany("Test Travel Co., Ltd.", config.legalSuffixes), normCompany("test travel", config.legalSuffixes));
});

test("validation enforces evidence, generic-inbox and pipeline rules", () => {
  const codes = (rec) => validateLead(normalizeLead(rec, dataset, config), dataset, config, { today: TODAY, preAssign: true }).filter((i) => i.level === "error").map((i) => i.code);
  assert.deepEqual(codes(person()), []);
  assert.ok(codes(person({ intent_class: "TRAVEL_INTENT", pipeline: "B2C_INTENT", company: "" })).includes("intent_without_evidence"));
  assert.ok(codes(person({ email: "info@example.com" })).includes("generic_email_on_person"));
  assert.ok(codes(person({ pipeline: "B2C_BROAD", intent_class: "TRAVEL_INTENT", intent_type: "Honeymoon", intent_evidence: "x" })).includes("broad_pipeline_class"));
  assert.ok(codes(person({ email: "not-an-email" })).includes("bad_email"));
  assert.ok(codes(person({ discovery_date: "2030-01-01" })).includes("future_date"));
  assert.ok(codes(person({ source_url: "" })).includes("missing_required"));
  assert.ok(codes(person({ destination_interest: "Japan", evidence: "" })).includes("interest_without_evidence"));
  assert.ok(codes(person({ email: "", phone: "", website: "" })).includes("no_contact_route"));
  assert.ok(codes(person({ lead_type: "ORGANIZATION", pipeline: "B2C_BROAD", company: "X" })).includes("pipeline_lead_type"));
});

test("a valid evidenced B2C intent lead passes", () => {
  const rec = person({
    pipeline: "B2C_INTENT",
    company: "",
    intent_class: "TRAVEL_INTENT",
    intent_type: "Honeymoon",
    intent_evidence: "public post asking for honeymoon itinerary help",
  });
  const issues = validateLead(normalizeLead(rec, dataset, config), dataset, config, { today: TODAY, preAssign: true });
  assert.deepEqual(issues.filter((i) => i.level === "error"), []);
});

test("sensitive terms are flagged as warnings", () => {
  const issues = validateLead(normalizeLead(person({ notes: "mentions a medical condition" }), dataset, config), dataset, config, { today: TODAY, preAssign: true });
  assert.ok(issues.some((i) => i.code === "sensitive_term"));
});

test("dedupe keys: same email = duplicate; different emails at one company stay separate", () => {
  const cfg = tempRoot();
  const a = person();
  const b = person({ first_name: "Other", last_name: "Colleague", email: "other.colleague@example.com" });
  const dupe = person({ email: "TEST.PERSON@example.com", source_url: "https://example.com/other-page", phone: "+44 20 7946 0000" });
  const r = runIngest({ config: cfg, records: [a, b, dupe], today: TODAY, runId: "t1" });
  assert.equal(r.report.added, 2);
  assert.equal(r.report.duplicates, 1);
  assert.equal(r.report.enriched, 1);
  assert.equal(r.master.length, 2);
  const first = r.master.find((x) => x.email === "test.person@example.com");
  assert.equal(first.phone, "+44 20 7946 0000", "blank field filled from the duplicate");
  assert.equal(first.lead_status, "READY_FOR_OUTREACH");
  assert.ok(first.source_history.includes("https://example.com/other-page"), "new source appended to history");
  assert.ok(first.source_history.includes("https://example.com/team"), "original source preserved");
});

test("person + company dedupe works without email; merge never overwrites", () => {
  const cfg = tempRoot();
  const a = person({ email: "", website: "https://example.com", job_title: "Founder" });
  const b = person({ email: "", website: "https://example.com", job_title: "CEO", source_url: "https://example.com/about" });
  const r = runIngest({ config: cfg, records: [a, b], today: TODAY, runId: "t2" });
  assert.equal(r.report.added, 1);
  assert.equal(r.report.duplicates, 1);
  assert.equal(r.report.conflicts, 1);
  assert.equal(r.master[0].job_title, "Founder", "existing value kept");
});

test("re-running the same batch adds nothing (idempotent) and master persists on disk", () => {
  const cfg = tempRoot();
  const batch = [person(), person({ first_name: "B", last_name: "C", email: "b.c@example.com" })];
  runIngest({ config: cfg, records: batch, today: TODAY, runId: "first" });
  const again = runIngest({ config: cfg, records: batch, today: TODAY, runId: "second" });
  assert.equal(again.report.added, 0);
  assert.equal(again.report.duplicates, 2);
  const onDisk = readMaster(loadDataset("leads", cfg));
  assert.equal(onDisk.length, 2);
  assert.ok(fs.existsSync(path.join(cfg.root, "reports", "run_second.md")));
  const ids = new Set(onDisk.map((r) => r.lead_id));
  assert.equal(ids.size, 2);
});

test("organisation contacts at one company are linked via existing_match, not merged", () => {
  const cfg = tempRoot();
  const org = { lead_type: "ORGANIZATION", company: "Test Planners Ltd", website: "https://example.org", email: "info@example.org", pipeline: "EVENTS_WEDDINGS", country: "France", source_url: "https://example.org/contact", source_type: "organization_website", discovery_date: "2026-10-01", discovery_method: "unit test", evidence: "contact page" };
  const contact = person({ company: "Test Planners Ltd", website: "https://example.org", email: "t.person@example.org", pipeline: "EVENTS_WEDDINGS", country: "France" });
  const r = runIngest({ config: cfg, records: [org, contact], today: TODAY, runId: "t3" });
  assert.equal(r.report.added, 2);
  assert.equal(r.master[1].existing_match, r.master[0].lead_id);
});

test("invalid and out-of-scope records are rejected, not stored; dry-run writes nothing", () => {
  const cfg = tempRoot();
  const bad = person({ email: "info@example.com" });
  const oos = person({ lead_status: "OUT_OF_SCOPE", email: "x@example.com" });
  const dry = runIngest({ config: cfg, records: [bad, oos, person()], today: TODAY, runId: "dry", dryRun: true });
  assert.equal(dry.report.invalid, 1);
  assert.equal(dry.report.outOfScope, 1);
  assert.equal(dry.report.added, 1);
  assert.equal(readMaster(loadDataset("leads", cfg)).length, 0, "dry run must not write");
  const real = runIngest({ config: cfg, records: [bad, oos, person()], today: TODAY, runId: "real" });
  assert.equal(readMaster(loadDataset("leads", cfg)).length, 1);
  assert.equal(real.rejected.length, 2);
  assert.ok(fs.existsSync(path.join(cfg.root, "data", "incoming", "rejected_real.json")));
});

test("unknown input columns are refused unless explicitly ignored", () => {
  const cfg = tempRoot();
  assert.throws(() => runIngest({ config: cfg, records: [{ ...person(), surprise: "x" }], today: TODAY, runId: "u" }), /unknown field/);
  const ok = runIngest({ config: cfg, records: [{ ...person(), surprise: "x" }], today: TODAY, runId: "u2", ignoreUnknown: true });
  assert.equal(ok.report.added, 1);
});

test("run reports contain counts only, never names or emails", () => {
  const cfg = tempRoot();
  runIngest({ config: cfg, records: [person()], today: TODAY, runId: "pii" });
  const md = fs.readFileSync(path.join(cfg.root, "reports", "run_pii.md"), "utf8");
  const json = fs.readFileSync(path.join(cfg.root, "reports", "run_pii.json"), "utf8");
  for (const s of ["test.person@example.com", "Test Person"]) {
    assert.ok(!md.includes(s) && !json.includes(s), `report leaks ${s}`);
  }
});

test("opportunities dataset: dedupes and requires a source", () => {
  const cfg = tempRoot();
  const opp = { opportunity: "Test Art Fair", category: "culture", date: "2027-03", location: "Paris", country: "France", source_url: "https://example.com/fair", discovery_date: "2026-10-01" };
  const r = runIngest({ config: cfg, datasetName: "opportunities", records: [opp, { ...opp }, { ...opp, opportunity: "No Source", source_url: "" }], today: TODAY, runId: "o" });
  assert.equal(r.report.added, 1);
  assert.equal(r.report.duplicates, 1);
  assert.equal(r.report.invalid, 1);
});

test("export splits CSV output into batches of at most 500 rows", () => {
  const cfg = tempRoot();
  const many = Array.from({ length: 1201 }, (_, i) => person({ first_name: `T${i}`, last_name: "Synthetic", email: `t${i}@example.com` }));
  runIngest({ config: cfg, records: many, today: TODAY, runId: "big" });
  // Run the real script against a temp copy of the module so ROOT resolves to the temp data.
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "wbm-export-"));
  fs.cpSync(cfg.root, path.join(copy, "lead-generation"), { recursive: true });
  fs.cpSync(path.join(ROOT, "scripts"), path.join(copy, "lead-generation", "scripts"), { recursive: true });
  const out = path.join(copy, "lead-generation", "exports", "t.csv");
  execFileSync("node", [path.join(copy, "lead-generation", "scripts", "export_leads.mjs"), "--out", out]);
  const files = fs.readdirSync(path.dirname(out)).filter((f) => f.startsWith("t_part")).sort();
  assert.deepEqual(files, ["t_part001.csv", "t_part002.csv", "t_part003.csv"]);
  const counts = files.map((f) => parseCsvRecords(fs.readFileSync(path.join(path.dirname(out), f), "utf8")).records.length);
  assert.deepEqual(counts, [500, 500, 201]);
});

test("scripts never contain email-sending or network code (email safety)", () => {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory() && e.name !== "tests") walk(p);
      else if (e.isFile() && p.endsWith(".mjs")) files.push(p);
    }
  };
  walk(path.join(dir, ".."));
  assert.ok(files.length > 5);
  const banned = /nodemailer|smtp|sendmail|resend|node:(net|tls|http|https|dgram)|\bfetch\s*\(|XMLHttpRequest|child_process/i;
  for (const f of files) assert.ok(!banned.test(fs.readFileSync(f, "utf8")), `${path.basename(f)} contains network/email code`);
});

test("config contains no secrets", () => {
  const dir = path.join(ROOT, "config");
  for (const f of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    assert.ok(!/(sk_live|sk-[a-z0-9]{20,}|eyJ[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16}|service_role|password\s*[:=])/i.test(text), `${f} looks like it contains a secret`);
  }
});

test("leadKeys priority: email first, then person+company", () => {
  const n = normalizeLead(person(), dataset, config);
  const keys = leadKeys(n, config);
  assert.equal(keys[0], "email:test.person@example.com");
  assert.ok(keys.some((k) => k.startsWith("person:")));
  assert.equal(n.duplicate_key, keys[0]);
});
