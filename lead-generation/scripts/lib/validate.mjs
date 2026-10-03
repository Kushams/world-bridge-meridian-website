// Validation of normalised records. Issues are { level: "error" | "warn", code, field, message }.
// Errors block a record from entering the master; warnings are reported.
import { readyForOutreach, oppKey } from "./normalize.mjs";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PARTIAL_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

function isRealDate(s) {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Fields filled in by the ingest step (IDs, dedupe key) are only required on stored records. */
const skipAssigned = (spec, preAssign) => preAssign && spec.assigned;

function checkField(spec, value, config, issues) {
  if (!value) return;
  const push = (code, message) => issues.push({ level: "error", code, field: spec.name, message });
  switch (spec.type) {
    case "enum":
      if (!spec.enum.includes(value)) push("bad_enum", `"${value}" is not one of: ${spec.enum.join(", ")}`);
      break;
    case "email":
      if (!config.emailRegex.test(value)) push("bad_email", `"${value}" is not a valid email address`);
      break;
    case "url":
      try {
        const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
        if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) throw new Error("bad url");
      } catch {
        push("bad_url", `"${value}" is not a valid http(s) URL`);
      }
      break;
    case "date":
      if (!isRealDate(value)) push("bad_date", `"${value}" is not a valid YYYY-MM-DD date`);
      break;
    case "partial_date":
      if (!PARTIAL_DATE.test(value)) push("bad_date", `"${value}" must be YYYY, YYYY-MM or YYYY-MM-DD`);
      break;
  }
}

/** Validate one normalised lead. `today` is YYYY-MM-DD (injectable for tests). */
export function validateLead(rec, dataset, config, { today, preAssign = false } = {}) {
  const issues = [];
  const err = (code, field, message) => issues.push({ level: "error", code, field, message });
  const warn = (code, field, message) => issues.push({ level: "warn", code, field, message });

  for (const spec of dataset.schema.fields) {
    const value = rec[spec.name] ?? "";
    if (spec.required === "always" && !value && !skipAssigned(spec, preAssign)) err("missing_required", spec.name, `${spec.name} is required`);
    checkField(spec, value, config, issues);
    if (value.length > config.validation.maxCellLength) warn("long_value", spec.name, `${spec.name} exceeds ${config.validation.maxCellLength} characters`);
  }

  if (preAssign && !rec.duplicate_key) {
    err("no_dedupe_key", "duplicate_key", "cannot derive a dedupe key: needs an email, a public profile URL, name + company, or (for organisations) company + website/phone");
  }
  if (rec.discovery_date && today && rec.discovery_date > today) err("future_date", "discovery_date", "discovery_date is in the future");

  const pipe = config.pipelines.pipelines[rec.pipeline];
  if (pipe && rec.lead_type && !pipe.leadTypes.includes(rec.lead_type)) {
    err("pipeline_lead_type", "lead_type", `${rec.pipeline} records must be ${pipe.leadTypes.join(" or ")}, not ${rec.lead_type}`);
  }

  if (rec.lead_type === "PERSON" && !rec.full_name) err("missing_identity", "full_name", "PERSON records need a published name (full_name or first+last)");
  if (rec.lead_type === "PERSON" && !rec.first_name) warn("no_first_name", "first_name", "no first_name (needed later for personalised outreach)");
  if (rec.lead_type === "ORGANIZATION" && !rec.company) err("missing_identity", "company", "ORGANIZATION records need a company name");

  if (!(rec.email || rec.phone || rec.website || rec.linkedin_url || rec.other_profile_url)) {
    err("no_contact_route", "email", "record has no contact route (email, phone, website or public profile)");
  }

  if (rec.email) {
    if (!rec.email_type) err("missing_email_type", "email_type", "email_type is required when email is set");
    if (rec.lead_type === "PERSON" && rec.email_type === "GENERAL_BUSINESS") {
      err("generic_email_on_person", "email", "a general business inbox must not be attached to a named person; store it on an ORGANIZATION record");
    }
    if (rec.lead_type === "ORGANIZATION" && rec.email_type === "PERSONAL") {
      warn("personal_email_on_org", "email", "personal email on an ORGANIZATION record; create a PERSON record for the contact");
    }
    if (!rec.evidence) warn("email_without_evidence", "evidence", "email present but evidence does not say where it was published");
  } else if (rec.email_type) {
    warn("email_type_without_email", "email_type", "email_type set without an email");
  }

  const intent = config.pipelines.intentClasses[rec.intent_class];
  if (intent?.requiresEvidence) {
    if (!rec.intent_evidence) err("intent_without_evidence", "intent_evidence", `${rec.intent_class} requires intent_evidence`);
    if (!rec.intent_type || rec.intent_type === "None Identified") err("intent_without_type", "intent_type", `${rec.intent_class} requires a specific intent_type`);
  }
  if (rec.pipeline === "B2C_INTENT" && !(intent?.requiresEvidence)) err("intent_pipeline_class", "intent_class", "B2C_INTENT records need an evidenced intent class");
  if (rec.pipeline === "B2C_BROAD" && rec.intent_class !== "BROAD_PROSPECT") err("broad_pipeline_class", "intent_class", "B2C_BROAD records must have intent_class BROAD_PROSPECT (use B2C_INTENT otherwise)");
  if (rec.intent_evidence && rec.intent_class === "BROAD_PROSPECT") warn("evidence_but_broad", "intent_class", "intent_evidence present but intent_class is BROAD_PROSPECT");
  if (rec.intent_class === "BROAD_PROSPECT" && rec.intent_type && rec.intent_type !== "None Identified") warn("type_but_broad", "intent_type", "intent_type set on a BROAD_PROSPECT");
  if ((rec.destination_interest || rec.seasonal_opportunity || rec.event_opportunity) && !(rec.evidence || rec.intent_evidence)) {
    err("interest_without_evidence", "evidence", "destination/seasonal/event fields need evidence or intent_evidence");
  }

  if (rec.lead_status === "READY_FOR_OUTREACH" && !readyForOutreach(rec, config)) {
    err("not_ready", "lead_status", "READY_FOR_OUTREACH requires: " + config.validation.readyForOutreach.requires.join(", ") + " and a name or company");
  }

  if (rec.country) {
    if (!config.countryLookup.has(rec.country.toLowerCase().replace(/\./g, ""))) {
      warn("unknown_country", "country", `country "${rec.country}" is not in config/countries.json`);
    }
  }

  const sensitive = new RegExp(config.validation.sensitiveTerms.join("|"), "i");
  for (const f of ["notes", "evidence", "intent_evidence", "job_title"]) {
    const m = rec[f]?.match(sensitive);
    if (m) warn("sensitive_term", f, `possible sensitive content ("${m[0]}") - remove personal sensitive data`);
  }
  return issues;
}

export function validateOpportunity(rec, dataset, config, { preAssign = false } = {}) {
  const issues = [];
  for (const spec of dataset.schema.fields) {
    const value = rec[spec.name] ?? "";
    if (spec.required === "always" && !value && !skipAssigned(spec, preAssign)) issues.push({ level: "error", code: "missing_required", field: spec.name, message: `${spec.name} is required` });
    checkField(spec, value, config, issues);
  }
  if (rec.date && rec.end_date && rec.end_date < rec.date) issues.push({ level: "error", code: "date_order", field: "end_date", message: "end_date is before date" });
  return issues;
}

/** Whole-dataset integrity checks on already-normalised master records. */
export function validateMasterIntegrity(records, dataset) {
  const issues = [];
  const note = (map, key, row, code, field) => {
    if (!key) return;
    if (map.has(key)) issues.push({ level: "error", code, field, row, message: `${field} "${key}" duplicates row ${map.get(key)}` });
    else map.set(key, row);
  };
  const ids = new Map();
  const emails = new Map();
  const keys = new Map();
  records.forEach((rec, i) => {
    const row = i + 2; // 1-based, counting the header row
    if (dataset.name === "leads") {
      note(ids, rec.lead_id, row, "duplicate_id", "lead_id");
      note(emails, rec.email, row, "duplicate_email", "email");
      note(keys, rec.duplicate_key, row, "duplicate_key", "duplicate_key");
    } else {
      note(ids, rec.opportunity_id, row, "duplicate_id", "opportunity_id");
      note(keys, oppKey(rec), row, "duplicate_opportunity", "opportunity");
    }
  });
  return issues;
}
