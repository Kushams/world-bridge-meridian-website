import { Partner } from "./types";

/**
 * No specific named partners have been confirmed. Categories only — do not
 * add a named hotel, airline, cruise line, or DMC here without written
 * confirmation from that partner.
 */
export const partners: Partner[] = [
  {
    category: "Hotels & Resorts",
    description:
      "We work with independently vetted hotels and resorts across our destinations, selected for consistency of service rather than brand alone.",
  },
  {
    category: "Airlines",
    description:
      "Flight coordination is arranged through established airline booking channels as part of a full journey.",
  },
  {
    category: "Cruise Operators",
    description:
      "Ocean and river cruise itineraries are arranged through established cruise line partners, confirmed at the time of booking.",
  },
  {
    category: "Destination Management Companies",
    description:
      "Local ground operators in each region handle transportation, guiding and on-the-ground logistics.",
  },
  {
    category: "Tour Operators",
    description: "Specialist local operators support activity and excursion bookings within destinations.",
  },
  {
    category: "Transportation Providers",
    description: "Private drivers, transfer services and rail partners are arranged per itinerary.",
  },
  {
    category: "Experience Providers",
    description: "Independent guides, chefs and instructors deliver the curated experiences within each journey.",
  },
  {
    category: "Cultural Organizations",
    description:
      "Museums, opera houses and cultural institutions are engaged directly for private access where available.",
  },
];

export const partnersStatement = "Selected hospitality and travel partners.";
