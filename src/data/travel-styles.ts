import { TravelStyleSlug } from "./types";

export interface TravelStyle {
  slug: TravelStyleSlug;
  label: string;
  description: string;
}

export const travelStyles: TravelStyle[] = [
  {
    slug: "luxury",
    label: "Luxury Travel",
    description:
      "Understated luxury — fine hotels, private experiences and premium arrangements at every step.",
  },
  {
    slug: "cultural",
    label: "Cultural Journeys",
    description:
      "Journeys built around history, heritage and the texture of daily life in a place.",
  },
  {
    slug: "adventure",
    label: "Adventure",
    description: "Active, exploratory travel into landscapes worth working for.",
  },
  {
    slug: "relaxation",
    label: "Relaxation",
    description: "Slower journeys, unhurried days and beautiful places to rest.",
  },
  {
    slug: "romance",
    label: "Romance",
    description: "Honeymoons, anniversaries and journeys designed for two.",
  },
  {
    slug: "family",
    label: "Family Travel",
    description: "Journeys that work for every generation traveling together.",
  },
  {
    slug: "arts-culture",
    label: "Arts & Culture",
    description: "Museums, galleries, opera and performance at the center of the journey.",
  },
  {
    slug: "cruise",
    label: "Cruise",
    description: "Ocean and river journeys across the world's classic and lesser-known routes.",
  },
  {
    slug: "food-wine",
    label: "Food & Wine",
    description: "Journeys organized around a region's kitchens, cellars and markets.",
  },
  {
    slug: "wellness",
    label: "Wellness",
    description: "Journeys designed around rest, movement and restoration.",
  },
  {
    slug: "business",
    label: "Corporate Travel",
    description: "Executive travel, retreats, conferences and incentive journeys.",
  },
  {
    slug: "bespoke",
    label: "Bespoke",
    description: "Entirely custom journeys, shaped around exactly what you have in mind.",
  },
];

export function travelStyleLabel(slug: TravelStyleSlug): string {
  return travelStyles.find((s) => s.slug === slug)?.label ?? slug;
}
