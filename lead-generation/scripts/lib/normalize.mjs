// Normalisation: turns a raw staged record into a clean, schema-shaped record.
// It only reformats and derives from configured rules; it never invents data.
import crypto from "node:crypto";

const collapse = (s) =>
  String(s ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const stripAccents = (s) => String(s).normalize("NFKD").replace(/\p{M}/gu, "");

/** Lowercase, accent-free, punctuation-free text used only for comparison keys. */
export const normText = (s) =>
  stripAccents(collapse(s))
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export function normCompany(s, legalSuffixes) {
  return normText(s)
    .split(" ")
    .filter((t) => t && !legalSuffixes.has(t))
    .join(" ");
}

export function hostOf(url) {
  const u = collapse(url);
  if (!u) return "";
  try {
    return new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normProfileUrl(url) {
  const u = collapse(url);
  if (!u) return "";
  try {
    const p = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : `https://${u}`);
    return `${p.hostname.toLowerCase().replace(/^www\./, "")}${p.pathname.replace(/\/+$/, "").toLowerCase()}`;
  } catch {
    return "";
  }
}

const enumKey = (s) => collapse(s).toUpperCase().replace(/[\s/&-]+/g, "_");

export function canonicalCountry(value, config) {
  const v = collapse(value);
  if (!v) return { name: "", known: false };
  const hit = config.countryLookup.get(v.toLowerCase().replace(/\./g, ""));
  return hit ? { name: hit.name, region: hit.region, known: true } : { name: v, known: false };
}

export function inferEmailType(email, config) {
  const local = email.split("@")[0].toLowerCase().replace(/[._-]+/g, "");
  return config.genericLocalParts.has(local) ? "GENERAL_BUSINESS" : "PERSONAL";
}

/** Dedupe keys for a normalised lead, highest priority first. */
export function leadKeys(rec, config) {
  const keys = [];
  if (rec.email) keys.push(`email:${rec.email}`);
  const profile = normProfileUrl(rec.linkedin_url);
  if (profile) keys.push(`profile:${profile}`);
  const name = normText(rec.full_name);
  const company = normCompany(rec.company, config.legalSuffixes);
  if (rec.lead_type === "PERSON" && name && company) keys.push(`person:${name}|${company}`);
  if (rec.lead_type === "ORGANIZATION" && company) {
    const host = hostOf(rec.website);
    const phone = collapse(rec.phone).replace(/\D/g, "");
    if (host) keys.push(`org:${company}|${host}`);
    else if (phone) keys.push(`org:${company}|${phone}`);
  }
  return keys;
}

/** Key identifying "same organisation" for existing_match grouping. */
export function orgKey(rec, config) {
  const company = normCompany(rec.company, config.legalSuffixes);
  return company ? `${company}|${hostOf(rec.website)}` : "";
}

export function makeId(prefix, key, taken = new Set()) {
  const hex = crypto.createHash("sha1").update(key).digest("hex");
  for (let n = 12; n <= hex.length; n += 2) {
    const id = `${prefix}${hex.slice(0, n)}`;
    if (!taken.has(id)) return id;
  }
  throw new Error(`Could not allocate a unique ID for ${key}`);
}

function deriveCampaign(rec, config) {
  const p = config.pipelines.pipelines[rec.pipeline];
  const i = config.pipelines.intentClasses[rec.intent_class];
  if (!p || !i) return "";
  return config.pipelines.campaignTemplate
    .replace("{pipeline}", p.label)
    .replace("{country}", rec.country || "Unspecified")
    .replace("{intent}", i.label);
}

export function readyForOutreach(rec, config) {
  const r = config.validation.readyForOutreach;
  return (
    r.requires.every((f) => rec[f]) && r.requiresOneOf.every((group) => group.some((f) => rec[f])) && rec.lead_status !== "OUT_OF_SCOPE"
  );
}

/**
 * Normalise one lead. `raw` may contain any subset of schema columns.
 * Returns a record with every column present (blank when unknown).
 */
export function normalizeLead(raw, dataset, config) {
  const rec = {};
  for (const col of dataset.columns) rec[col] = collapse(raw[col]);

  rec.email = rec.email.toLowerCase();
  rec.lead_type = enumKey(rec.lead_type);
  rec.pipeline = enumKey(rec.pipeline);
  rec.lead_status = enumKey(rec.lead_status);
  rec.email_type = enumKey(rec.email_type);
  rec.intent_class = enumKey(rec.intent_class) || "BROAD_PROSPECT";
  rec.relevance = enumKey(rec.relevance);
  rec.source_type = collapse(rec.source_type).toLowerCase().replace(/[\s-]+/g, "_");

  if (!rec.full_name && rec.first_name && rec.last_name) rec.full_name = `${rec.first_name} ${rec.last_name}`;
  if (rec.email && !rec.email_type) rec.email_type = inferEmailType(rec.email, config);

  const country = canonicalCountry(rec.country, config);
  rec.country = country.name;
  if (!rec.region && country.known) rec.region = country.region;

  const pipe = config.pipelines.pipelines[rec.pipeline];
  if (!rec.customer_type && pipe) rec.customer_type = pipe.customer_type;
  if (!rec.intent_type) rec.intent_type = "None Identified";
  if (!rec.campaign) rec.campaign = deriveCampaign(rec, config);

  if (!rec.last_updated && rec.discovery_date) rec.last_updated = rec.discovery_date;
  if (!rec.source_history && rec.source_url) {
    rec.source_history = [rec.discovery_date, rec.source_type, rec.source_url].join("|");
  }

  const keys = leadKeys(rec, config);
  if (!rec.duplicate_key) rec.duplicate_key = keys[0] ?? "";
  if (!rec.lead_status) rec.lead_status = "DISCOVERED";
  return rec;
}

export function oppKey(rec) {
  return `opp:${normText(rec.opportunity)}|${rec.date}|${normText(rec.location)}`;
}

export function normalizeOpportunity(raw, dataset, config) {
  const rec = {};
  for (const col of dataset.columns) rec[col] = collapse(raw[col]);
  rec.category = enumKey(rec.category);
  const country = canonicalCountry(rec.country, config);
  rec.country = country.name;
  return rec;
}
