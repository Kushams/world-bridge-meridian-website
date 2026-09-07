import { Destination } from "@/data/types";
import { InterestTag } from "@/data/interests";

/**
 * Derives interest tags for a destination from its existing travel styles
 * and highlight/description text — a deterministic keyword mapping, not a
 * recommendation engine or AI classifier. No destination is hand-tagged
 * individually; this keeps the Travel by Interest page working across the
 * full destination catalog without a large manual tagging pass, at the
 * cost of being a best-effort match rather than a curated one. Refine
 * individual results by hand over time if a specific pairing looks wrong.
 */

const styleToInterests: Partial<Record<Destination["travelStyles"][number], InterestTag[]>> = {
  luxury: ["Luxury"],
  cultural: ["History", "Heritage"],
  adventure: ["Adventure", "Nature"],
  relaxation: ["Wellness", "Beaches"],
  romance: ["Romance"],
  family: ["Family"],
  "arts-culture": ["Art", "Museums", "Galleries", "Architecture"],
  cruise: ["Cruises", "Beaches"],
  "food-wine": ["Food & Wine"],
  wellness: ["Wellness"],
};

const keywordToInterest: Array<[RegExp, InterestTag]> = [
  [/\bmuseum/i, "Museums"],
  [/\bgaller(y|ies)\b/i, "Galleries"],
  [/\bopera\b/i, "Opera"],
  [/\bart fair/i, "Art Fairs"],
  [/\barchitecture\b/i, "Architecture"],
  [/\bhistor(y|ic)/i, "History"],
  [/\bheritage\b/i, "Heritage"],
  [/\b(wine|vineyard|cuisine|culinary|trattoria|market)/i, "Food & Wine"],
  [/\b(safari|wildlife|animals)\b/i, "Wildlife"],
  [/\b(beach|coast|island|lagoon)/i, "Beaches"],
  [/\b(hik(e|ing)|trek|trail|mountain)/i, "Adventure"],
  [/\b(national park|rainforest|jungle|nature reserve)/i, "Nature"],
  [/\b(ski|golf|diving|surf)/i, "Sport"],
  [/\b(boutique shopping|shopping district|souks?|bazaar)/i, "Shopping"],
  [/\bfashion\b/i, "Fashion"],
  [/\b(modernist|design district)/i, "Design"],
  [/\bphotograph/i, "Photography"],
  [/\b(spa|wellness|yoga|retreat)/i, "Wellness"],
  [/\bhoneymoon/i, "Romance"],
];

export function deriveInterestTags(destination: Destination): InterestTag[] {
  const tags = new Set<InterestTag>();

  for (const style of destination.travelStyles) {
    for (const tag of styleToInterests[style] ?? []) tags.add(tag);
  }

  const text = [destination.shortDescription, ...destination.description, ...destination.highlights]
    .join(" ")
    .toLowerCase();

  for (const [pattern, tag] of keywordToInterest) {
    if (pattern.test(text)) tags.add(tag);
  }

  return Array.from(tags);
}
