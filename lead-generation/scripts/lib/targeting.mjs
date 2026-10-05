// Targeting rules (config/targeting.json): travel sellers are out of scope.
import fs from "node:fs";
import path from "node:path";

export function loadTargeting(root) {
  const t = JSON.parse(fs.readFileSync(path.join(root, "config", "targeting.json"), "utf8"));
  return { pipelines: new Set(t.excludedPipelines), types: t.excludedOrganizationTypePatterns.map((p) => new RegExp(p, "i")) };
}

/** Returns a reason string if the record is not a target, else null. */
export function outOfScopeReason(rec, targeting) {
  if (targeting.pipelines.has(rec.pipeline)) return `pipeline ${rec.pipeline} is not a target`;
  const hit = targeting.types.find((re) => re.test(rec.organization_type || ""));
  return hit ? `organization type "${rec.organization_type}" is a travel seller` : null;
}
