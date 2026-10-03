// Report builders. Reports contain counts and row numbers only - never names or emails.

const pct = (n, d) => (d ? `${((n / d) * 100).toFixed(1)}%` : "n/a");

export function tally(records, field) {
  const m = new Map();
  for (const r of records) {
    const k = r[field] || "(blank)";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const table = (rows, head = ["Value", "Count"]) =>
  rows.length === 0
    ? "_none_\n"
    : `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;

/** Missing-field rates across a set of lead records. */
export function missingRates(records, fields) {
  return fields.map((f) => {
    const missing = records.filter((r) => !r[f]).length;
    return [f, String(missing), pct(missing, records.length)];
  });
}

const KEY_FIELDS = ["email", "phone", "job_title", "company", "website", "city", "country", "linkedin_url", "evidence"];

/** Per-source-type counts and data quality (actual counts, no "best source" claims). */
export function sourcePerformance(records) {
  const groups = new Map();
  for (const r of records) {
    const k = r.source_type || "(blank)";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([type, rs]) => [
      type,
      String(rs.length),
      `${rs.filter((r) => r.email).length} (${pct(rs.filter((r) => r.email).length, rs.length)})`,
      `${rs.filter((r) => r.lead_status === "READY_FOR_OUTREACH").length} (${pct(rs.filter((r) => r.lead_status === "READY_FOR_OUTREACH").length, rs.length)})`,
      `${rs.filter((r) => r.intent_evidence).length}`,
    ]);
}

/** Coverage gaps against the configured target markets. */
export function coverageGaps(records, config) {
  const counts = new Map(tally(records, "country"));
  const primary = config.countries.countries.filter((c) => c.tier === "primary").map((c) => c.name);
  const secondary = config.countries.countries.filter((c) => c.tier === "secondary").map((c) => c.name);
  const pipelinesEmpty = Object.keys(config.pipelines.pipelines).filter((p) => !records.some((r) => r.pipeline === p));
  return {
    primaryWithNone: primary.filter((c) => !counts.has(c)),
    secondaryWithNone: secondary.filter((c) => !counts.has(c)),
    pipelinesWithNone: pipelinesEmpty,
  };
}

export function buildMasterSummary(records, config, today) {
  const withEmail = records.filter((r) => r.email).length;
  const byCountry = tally(records, "country");
  const countryTier = (name) => config.countries.countries.find((c) => c.name === name);
  const geo = (pred) => byCountry.filter(([c]) => pred(countryTier(c)));
  return {
    generated: today,
    total: records.length,
    withEmail,
    withoutEmail: records.length - withEmail,
    ready: records.filter((r) => r.lead_status === "READY_FOR_OUTREACH").length,
    byPipeline: tally(records, "pipeline"),
    byCountry,
    byRegion: tally(records, "region"),
    byIntent: tally(records, "intent_class"),
    byStatus: tally(records, "lead_status"),
    byCampaign: tally(records, "campaign"),
    europe: geo((c) => c?.region === "Europe" && c.name !== "UK"),
    asia: geo((c) => c?.region === "Asia"),
    sources: sourcePerformance(records),
    missing: missingRates(records, KEY_FIELDS),
    gaps: coverageGaps(records, config),
  };
}

export function renderMasterSummary(s) {
  const gaps = s.gaps;
  return `# Master leads summary

Generated: ${s.generated}
Source of truth: \`data/master/master_leads.csv\`

## Totals

- Total leads: **${s.total}**
- With email: ${s.withEmail} (${pct(s.withEmail, s.total)})
- Without email: ${s.withoutEmail}
- READY_FOR_OUTREACH: ${s.ready}

## By pipeline

${table(s.byPipeline)}
## By intent class

${table(s.byIntent)}
## By status

${table(s.byStatus)}
## By country

${table(s.byCountry)}
### Europe (by country)

${table(s.europe)}
### Asia (by country)

${table(s.asia)}
## Source performance (actual counts and data quality)

${table(s.sources, ["Source type", "Leads", "With email", "Ready for outreach", "With intent evidence"])}
## Missing fields

${table(s.missing, ["Field", "Missing", "Share"])}
## Coverage gaps (inputs for the next discovery cycle)

- Primary markets with no leads: ${gaps.primaryWithNone.join(", ") || "none"}
- Secondary markets (Asia/Australia) with no leads: ${gaps.secondaryWithNone.join(", ") || "none"}
- Pipelines with no leads: ${gaps.pipelinesWithNone.join(", ") || "none"}
`;
}

export function renderRunReport(r) {
  const list = (rows) => (rows.length ? rows.map(([k, v]) => `${k} (${v})`).join(", ") : "none");
  return `# Lead-generation run ${r.runId}

- Date: ${r.date}
- Dataset: ${r.dataset}
- Input: \`${r.input}\`${r.dryRun ? "\n- **DRY RUN: nothing was written**" : ""}

## Totals

| Metric | Count |
|---|---|
| Records in input | ${r.discovered} |
| New leads added | ${r.added} |
| Duplicates of existing records | ${r.duplicates} |
| - of which enriched an existing record | ${r.enriched} |
| - field conflicts left untouched | ${r.conflicts} |
| Invalid (rejected, see issue summary) | ${r.invalid} |
| Out of scope | ${r.outOfScope} |
| New leads with email | ${r.withEmail} |
| New leads without email | ${r.withoutEmail} |
| Master size after run | ${r.masterAfter} |

## Coverage of this run (new leads)

- Countries: ${list(r.countries)}
- Pipelines: ${list(r.pipelines)}
- Campaigns: ${list(r.campaigns)}
- Intent classes: ${list(r.intents)}

## Sources used

${table(r.sources, ["Source type", "Records"])}
## Issue summary (codes only; details are in the git-ignored rejected file)

${table(r.issueCodes, ["Code", "Occurrences"])}
## Gaps

- Primary markets still with no leads: ${r.gaps.primaryWithNone.join(", ") || "none"}
- Pipelines still with no leads: ${r.gaps.pipelinesWithNone.join(", ") || "none"}
- Missing-field rates among new leads:

${table(r.missing, ["Field", "Missing", "Share"])}
## Problems

${r.problems.length ? r.problems.map((p) => `- ${p}`).join("\n") : "- none"}
`;
}

export { KEY_FIELDS };
