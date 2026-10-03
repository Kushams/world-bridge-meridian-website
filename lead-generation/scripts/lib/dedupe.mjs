// Deduplication index + fill-blank-only merge (config/dedupe.json).
import { leadKeys, orgKey, readyForOutreach } from "./normalize.mjs";

/** In-memory index of master records: dedupe key -> record, plus org grouping. */
export class LeadIndex {
  constructor(records, config) {
    this.config = config;
    this.byKey = new Map();
    this.byOrg = new Map();
    this.ids = new Set();
    for (const r of records) this.add(r);
  }

  add(rec) {
    this.ids.add(rec.lead_id);
    for (const k of leadKeys(rec, this.config)) if (!this.byKey.has(k)) this.byKey.set(k, rec);
    if (rec.duplicate_key && !this.byKey.has(rec.duplicate_key)) this.byKey.set(rec.duplicate_key, rec);
    const o = orgKey(rec, this.config);
    if (o && !this.byOrg.has(o)) this.byOrg.set(o, rec);
  }

  /** Existing record matching any key of `rec`, with the key that matched. */
  find(rec) {
    for (const k of leadKeys(rec, this.config)) {
      const hit = this.byKey.get(k);
      if (hit) return { record: hit, key: k };
    }
    return null;
  }

  /** Another record at the same organisation (kept separate as a different contact). */
  sameOrg(rec) {
    const o = orgKey(rec, this.config);
    return o ? (this.byOrg.get(o) ?? null) : null;
  }
}

/**
 * Merge `incoming` into `existing` in place without overwriting anything:
 * fills blanks, appends new source history, flags conflicts.
 * Returns { filled: string[], conflicts: string[], newSource: boolean }.
 */
export function mergeInto(existing, incoming, config, today) {
  const never = new Set(config.dedupe.merge.neverOverwrite);
  const skip = new Set(["source_history", "last_updated", "lead_status", "duplicate_key", "existing_match", "campaign", "customer_type"]);
  const filled = [];
  const conflicts = [];
  for (const [field, value] of Object.entries(incoming)) {
    if (skip.has(field) || !value) continue;
    if (!existing[field]) {
      // Don't import the default intent placeholder as "new information".
      if (field === "intent_type" && value === "None Identified") continue;
      existing[field] = value;
      filled.push(field);
    } else if (existing[field] !== value && !never.has(field) && field !== "intent_type" && field !== "intent_class") {
      conflicts.push(field);
    }
  }

  let newSource = false;
  const entry = [incoming.discovery_date, incoming.source_type, incoming.source_url].join("|");
  if (incoming.source_url && !existing.source_history.includes(incoming.source_url)) {
    existing.source_history = existing.source_history ? `${existing.source_history} || ${entry}` : entry;
    newSource = true;
  }
  if (filled.length > 0 || newSource) existing.last_updated = today;
  if (filled.length > 0 && existing.lead_status === "DISCOVERED") existing.lead_status = "ENRICHED";
  if (filled.length > 0 && readyForOutreach(existing, config) && existing.lead_status !== "READY_FOR_OUTREACH") {
    existing.lead_status = "READY_FOR_OUTREACH";
  }
  return { filled, conflicts, newSource };
}
