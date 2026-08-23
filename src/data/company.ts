/**
 * Single source of truth for company-wide facts. Update here, not inline
 * across pages. Anything marked "TO BE PROVIDED" is a genuine placeholder —
 * do not invent a value for it.
 */

export const SITE_URL = "https://worldbridgemeridian.group";

export const company = {
  name: "World Bridge Meridian",
  legalPositioning: "A Bespoke Travel Group",
  foundedYear: 2012,
  founderName: "Earl Anderson",
  founderTitle: "Founder & CEO",
  email: "info@worldbridgemeridian.group",
  phone: null as string | null, // "[PHONE NUMBER TO BE PROVIDED]"
  whatsapp: null as string | null, // "[WHATSAPP NUMBER TO BE PROVIDED]"
  address: null as string | null, // "[ADDRESS TO BE PROVIDED]"
  cooName: "Justin Warkovsky" as string | null,
  cryptoAcceptedSince: 2015,
  cryptoCurrencies: ["Bitcoin (BTC)", "Tether (USDT)", "Solana (SOL)"],

  tagline:
    "World Bridge Meridian designs and organizes thoughtful journeys, curated travel experiences, group departures, cruises, cultural adventures and bespoke escapes around the world.",

  heroEyebrow: "Bespoke Travel · Organised Journeys",
  heroHeadlineLines: [
    "The world feels different",
    "when it is yours to explore.",
  ],

  footerTagline: "Bespoke travel group. Thoughtfully organized.",

  pricingDisclaimer:
    "Prices shown are indicative starting prices and may vary based on travel dates, availability, accommodation selection, number of travelers, supplier pricing, seasonal demand, activities, transportation and requested upgrades. Final pricing is confirmed after consultation and availability checks.",

  sampleDataDisclaimer:
    "Sample journey — shown for illustration while we connect live supplier data. Availability is confirmed after enquiry.",

  reviewDisclaimer:
    "Sample testimonial — replace with verified client review before launch.",

  partnersStatement: "Selected hospitality and travel partners.",

  copyrightLine: (year: number) =>
    `© ${year} ${company.name}. All rights reserved.`,
} as const;

export const socialLinks: { label: string; href: string | null }[] = [
  { label: "Instagram", href: null },
  { label: "Facebook", href: null },
  { label: "LinkedIn", href: null },
];
