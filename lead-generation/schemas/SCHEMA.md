# Lead schema

Machine-readable definitions: [`lead.schema.json`](lead.schema.json) (44 columns) and
[`opportunity.schema.json`](opportunity.schema.json) (12 columns). **Column order in those files is the column
order of the CSVs.** Scripts read these files; this page explains them.

Rule zero: **an unknown value is a blank cell.** Never guess a name, email, phone, title, company, travel plan,
destination or intent. Never build an email from a naming pattern.

## `master_leads.csv` columns

| Group | Columns |
|---|---|
| Identity | `lead_id`, `lead_type` |
| Person | `first_name`, `last_name`, `full_name`, `email`, `email_type`, `phone`, `job_title`, `department`, `linkedin_url`, `other_profile_url` |
| Organization | `company`, `website`, `industry`, `organization_type`, `company_size` |
| Geography | `city`, `state_province`, `country`, `region` |
| Classification | `pipeline`, `customer_type`, `campaign`, `intent_class`, `intent_type`, `travel_category`, `destination_interest`, `seasonal_opportunity`, `event_opportunity`, `potential_use_case`, `relevance` |
| Source | `source_url`, `source_type`, `discovery_date`, `discovery_method`, `evidence`, `intent_evidence` |
| Database | `duplicate_key`, `existing_match`, `lead_status`, `source_history`, `last_updated`, `notes` |

Always required: `lead_id`, `lead_type`, `country`, `pipeline`, `source_url`, `source_type`, `discovery_date`,
`discovery_method`, `duplicate_key`, `lead_status`. (`lead_id` and `duplicate_key` are assigned by ingest.)

### Enumerations

- `lead_type`: `PERSON` | `ORGANIZATION`. Never "customer": a lead is a prospect until the CRM says otherwise.
- `email_type`: `PERSONAL` | `GENERAL_BUSINESS`. Inferred from the local part (`info@`, `hello@`, ... see
  `config/validation.json`) when omitted. A generic inbox is stored on an `ORGANIZATION` record, never attached to a named person.
- `pipeline`: `B2C_BROAD`, `B2C_INTENT`, `B2B_CORPORATE`, `TRAVEL_INDUSTRY`, `CONCIERGE_LUXURY`, `EVENTS_WEDDINGS`,
  `ARTS_CULTURE`, `INSTITUTIONAL`, `CRUISE`, `GROUP_TRAVEL`, `STRATEGIC_PARTNERS`.
- `customer_type`: derived from the pipeline (B2C, B2B, Institutional, Travel Industry, Strategic Partnership,
  Events/Weddings, Arts & Culture, Group Travel, Cruise, Other).
- `intent_class`: `BROAD_PROSPECT` (default), `TRAVEL_INTENT`, `EVENT_INTENT`, `SEASONAL_OPPORTUNITY`,
  `DESTINATION_INTEREST`, `CORPORATE_OPPORTUNITY`, `PARTNERSHIP_OPPORTUNITY`.
- `relevance`: `HIGH_RELEVANCE` | `MEDIUM_RELEVANCE` | `BROAD_PROSPECT`. An operational priority, never a booking probability.
- `lead_status`: `DISCOVERED`, `ENRICHED`, `READY_FOR_OUTREACH` are stored. `DUPLICATE` and `OUT_OF_SCOPE` are
  reported by ingest but not stored in the master.
- `source_type`: see `lead.schema.json` (`company_website`, `business_directory`, `event_website`, `public_forum`, ... , `other`).

### Derived / assigned values

| Field | How it is set |
|---|---|
| `lead_id` | `WBM-` + 12 hex of SHA-1 of the primary duplicate key at first insert. Stable afterwards. |
| `duplicate_key` | Highest-priority key: `email:` > `profile:` > `person:` > `org:` (see `config/dedupe.json`). |
| `country` | Canonical name via `config/countries.json` (US/United States -> `USA`, United Kingdom -> `UK`, ...). |
| `region` | From the country when blank. |
| `customer_type` | From the pipeline when blank. |
| `campaign` | `<pipeline label> \| <country> \| <intent label>` when blank, e.g. `B2C Broad \| USA \| Broad Prospect`. |
| `intent_type` | `None Identified` when there is no evidence. |
| `lead_status` | `READY_FOR_OUTREACH` when email + source + date + country + pipeline + (name or company) are present, else `DISCOVERED`; `ENRICHED` after a merge adds information. |
| `existing_match` | `lead_id` of another record at the same organisation that was kept as a separate contact. |
| `source_history` | `date\|source_type\|url` entries joined by ` \|\| `; appended, never rewritten. |

## Cross-field rules (enforced by `validate_leads.mjs` / ingest)

1. `PERSON` needs a published name; `ORGANIZATION` needs a `company`. B2C pipelines are `PERSON` only.
2. At least one contact route: email, phone, website or a public profile URL.
3. `email` requires `email_type`; `GENERAL_BUSINESS` on a `PERSON` is an error. `evidence` should say where the email was published.
4. `TRAVEL_INTENT`, `EVENT_INTENT`, `SEASONAL_OPPORTUNITY`, `DESTINATION_INTEREST` require `intent_evidence` and a specific `intent_type`.
5. `B2C_INTENT` requires an evidenced intent class; `B2C_BROAD` requires `BROAD_PROSPECT`. Absence of intent is not a reason to discard a prospect.
6. `destination_interest`, `seasonal_opportunity`, `event_opportunity` need `evidence` or `intent_evidence`. Destination is a field, never a campaign.
7. `READY_FOR_OUTREACH` must satisfy the readiness rule in `config/validation.json`.
8. Dates are real `YYYY-MM-DD` dates, not in the future. URLs are http(s).
9. Warnings: unknown country, possible sensitive content (health, religion, politics, finances...), overly long values.
10. Master integrity: `lead_id`, `email` and `duplicate_key` are unique.

Geographic campaigns come from `country` (USA, Canada and UK separate; Europe and Asia split by country; Australia
separate; Africa is incidental, not actively prospected) - there are no destination-based primary campaigns.

## `opportunities.csv` (seasonal / event dataset)

`opportunity_id`, `opportunity`, `category` (`HOLIDAY` | `LIFE_EVENT` | `CULTURE` | `CORPORATE` | `LEISURE` | `OTHER`),
`date`, `end_date`, `location`, `country`, `source_url`, `potential_audience`, `wbm_use_case`, `discovery_date`, `notes`.
Every row needs a source. Never fabricate an event. Deduped on name + date + location.
