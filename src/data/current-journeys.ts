import { CurrentJourney } from "./types";
import { themeImage } from "./images";

/**
 * These are SAMPLE / INDICATIVE journeys, not a live availability feed —
 * every entry carries an explicit status label. See README "Sample /
 * indicative data" and the pricing disclaimer shown alongside this list.
 */
export const currentJourneys: CurrentJourney[] = [
  {
    slug: "summer-europe-escapes",
    title: "Summer Europe Escapes",
    destinationSlugs: ["paris", "barcelona", "rome"],
    travelPeriod: "June – August 2026",
    duration: "8–12 days",
    travelType: "Family / Couples",
    heroImage: themeImage("cityscape", 1),
    indicativePricing: { label: "From", amount: 2650, currency: "USD", unit: "per person" },
    status: "Indicative Journey",
  },
  {
    slug: "mediterranean-cruise-journeys",
    title: "Mediterranean Cruise Journeys",
    destinationSlugs: ["barcelona", "rome", "venice"],
    travelPeriod: "May – October 2026",
    duration: "7–10 nights",
    travelType: "Cruise",
    heroImage: themeImage("cruiseAndSea", 0),
    indicativePricing: { label: "From", amount: 1650, currency: "USD", unit: "per person" },
    status: "Sample Journey",
  },
  {
    slug: "christmas-in-europe",
    title: "Christmas in Europe",
    destinationSlugs: ["vienna", "prague"],
    travelPeriod: "December 2026",
    duration: "6–8 days",
    travelType: "Family / Couples",
    heroImage: themeImage("cityscape", 9),
    indicativePricing: { label: "From", amount: 2450, currency: "USD", unit: "per person" },
    status: "Indicative Journey",
  },
  {
    slug: "caribbean-winter-escapes",
    title: "Caribbean Winter Escapes",
    destinationSlugs: ["miami"],
    travelPeriod: "December 2026 – March 2027",
    duration: "7–8 nights",
    travelType: "Cruise / Beach",
    heroImage: themeImage("tropicalBeach", 1),
    indicativePricing: { label: "From", amount: 1850, currency: "USD", unit: "per person" },
    status: "Sample Journey",
  },
  {
    slug: "barcelona-family-journey",
    title: "Barcelona Family Journey",
    destinationSlugs: ["barcelona"],
    travelPeriod: "Year-round",
    duration: "5–7 days",
    travelType: "Family",
    heroImage: themeImage("cityscape", 10),
    indicativePricing: { label: "From", amount: 2250, currency: "USD", unit: "per person" },
    status: "Enquiry-Based Journey",
  },
  {
    slug: "paris-arts-culture",
    title: "Paris Arts & Culture",
    destinationSlugs: ["paris"],
    travelPeriod: "Year-round",
    duration: "4–6 days",
    travelType: "Arts & Culture",
    heroImage: themeImage("cityscape", 1),
    indicativePricing: { label: "From", amount: 2750, currency: "USD", unit: "per person" },
    status: "Enquiry-Based Journey",
  },
  {
    slug: "rome-couples-escape",
    title: "Rome Couples Escape",
    destinationSlugs: ["rome"],
    travelPeriod: "Year-round",
    duration: "4–5 days",
    travelType: "Couples",
    heroImage: themeImage("culturalHeritage", 0),
    indicativePricing: { label: "From", amount: 2450, currency: "USD", unit: "per person" },
    status: "Enquiry-Based Journey",
  },
  {
    slug: "new-york-holiday-experience",
    title: "New York Holiday Experience",
    destinationSlugs: ["new-york"],
    travelPeriod: "November – December 2026",
    duration: "4–5 days",
    travelType: "Family",
    heroImage: themeImage("cityscape", 5),
    indicativePricing: { label: "From", amount: 3150, currency: "USD", unit: "per person" },
    status: "Indicative Journey",
  },
  {
    slug: "japan-cherry-blossom-2027",
    title: "Japan Cherry Blossom Journey",
    destinationSlugs: ["tokyo", "kyoto"],
    travelPeriod: "Late March – Early April 2027",
    duration: "10–11 days",
    travelType: "Cultural",
    heroImage: themeImage("cityscape", 13),
    indicativePricing: { label: "From", amount: 3150, currency: "USD", unit: "per person" },
    status: "Indicative Journey",
  },
  {
    slug: "safari-migration-season",
    title: "Great Migration Safari",
    destinationSlugs: ["nairobi"],
    travelPeriod: "July – October 2026",
    duration: "9–10 days",
    travelType: "Adventure",
    heroImage: themeImage("safari", 0),
    indicativePricing: { label: "From", amount: 4250, currency: "USD", unit: "per person" },
    status: "Sample Journey",
  },
];

export function getCurrentJourney(slug: string) {
  return currentJourneys.find((j) => j.slug === slug);
}
