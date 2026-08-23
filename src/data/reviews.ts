import { Review } from "./types";

/**
 * All entries here are SAMPLE testimonials for development/design purposes.
 * Every one carries sample: true and must display the sample-testimonial
 * disclaimer (see company.reviewDisclaimer). Replace with verified client
 * reviews, keeping the same shape, before launch.
 */
export const reviews: Review[] = [
  {
    id: "r1",
    name: "M. Sanders",
    destination: "Italy",
    tripType: "family",
    year: 2025,
    rating: 5,
    quote:
      "We told them roughly what we wanted and they built the rest. The pace through Rome, Florence and Venice was exactly right for two kids under ten.",
    sample: true,
  },
  {
    id: "r2",
    name: "J. & R. Okafor",
    destination: "Santorini",
    tripType: "romance",
    year: 2025,
    rating: 5,
    quote:
      "Every detail of the honeymoon was arranged before we landed. The caldera suite was even better than the photos.",
    sample: true,
  },
  {
    id: "r3",
    name: "D. Whitfield",
    destination: "Kenya & Tanzania",
    tripType: "adventure",
    year: 2024,
    rating: 5,
    quote:
      "The safari logistics alone would have been overwhelming to plan ourselves. Every bush flight and lodge transfer was seamless.",
    sample: true,
  },
  {
    id: "r4",
    name: "C. Lindqvist",
    destination: "Japan",
    tripType: "cultural",
    year: 2025,
    rating: 5,
    quote:
      "The private tea ceremony in Kyoto was the highlight of the whole trip, and something we never would have found on our own.",
    sample: true,
  },
  {
    id: "r5",
    name: "A. Marchetti",
    destination: "Mediterranean Cruise",
    tripType: "cruise",
    year: 2024,
    rating: 4,
    quote:
      "A well-organized cruise pairing with a few days in Rome beforehand. Communication throughout the planning process was excellent.",
    sample: true,
  },
  {
    id: "r6",
    name: "The Osei Family",
    destination: "Cape Town",
    tripType: "family",
    year: 2025,
    rating: 5,
    quote:
      "Cape Town, the Winelands and a short safari extension — a lot to coordinate, and it all ran smoothly.",
    sample: true,
  },
  {
    id: "r7",
    name: "P. Kowalski",
    destination: "Vienna",
    tripType: "arts-culture",
    year: 2024,
    rating: 5,
    quote:
      "They arranged opera tickets that we couldn't get on our own, plus a private guide at the Kunsthistorisches Museum.",
    sample: true,
  },
  {
    id: "r8",
    name: "S. & T. Nakamura",
    destination: "Maldives",
    tripType: "luxury",
    year: 2025,
    rating: 5,
    quote:
      "The overwater villa recommendation matched exactly what we wanted, right down to the reef access.",
    sample: true,
  },
  {
    id: "r9",
    name: "R. Delgado",
    destination: "Marrakech",
    tripType: "bespoke",
    year: 2024,
    rating: 4,
    quote:
      "The Sahara overnight was arranged with almost no notice on our part — they made it happen within a week.",
    sample: true,
  },
  {
    id: "r10",
    name: "Global Health Forum",
    destination: "Lisbon",
    tripType: "business",
    year: 2025,
    rating: 5,
    quote:
      "Our leadership retreat for 24 people was handled from meeting logistics through to the closing dinner. Genuinely stress-free for our team.",
    sample: true,
  },
  {
    id: "r11",
    name: "H. Bergström",
    destination: "Bali",
    tripType: "wellness",
    year: 2024,
    rating: 5,
    quote:
      "Exactly the reset I was hoping for. The villa and the wellness schedule were both perfectly judged.",
    sample: true,
  },
  {
    id: "r12",
    name: "The Whitmore-Clarke Family",
    destination: "New York",
    tripType: "family",
    year: 2025,
    rating: 4,
    quote:
      "A concentrated few days that still felt unrushed. The museum guide was fantastic with our teenagers.",
    sample: true,
  },
];

export function averageRating(): number {
  return (
    Math.round(
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10,
    ) / 10
  );
}
