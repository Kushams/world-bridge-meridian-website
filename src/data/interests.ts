/**
 * Canonical travel-interest tags — shared by the Journey Wizard (what a
 * client is drawn to) and the Travel by Interest discovery page (how a
 * visitor browses). Keeping one list means the two systems can never drift
 * apart.
 */
export const interestTags = [
  "Art",
  "Museums",
  "Opera",
  "Galleries",
  "Art Fairs",
  "Architecture",
  "History",
  "Food & Wine",
  "Adventure",
  "Nature",
  "Wildlife",
  "Beaches",
  "Cruises",
  "Fashion",
  "Design",
  "Shopping",
  "Photography",
  "Sport",
  "Family",
  "Romance",
  "Wellness",
  "Luxury",
  "Heritage",
] as const;

export type InterestTag = (typeof interestTags)[number];

export const travelerProfiles = [
  "Solo",
  "Couple",
  "Family",
  "Friends",
  "Group",
  "Corporate",
  "Institution",
] as const;

export type TravelerProfile = (typeof travelerProfiles)[number];
