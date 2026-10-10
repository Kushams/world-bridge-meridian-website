import { Stay } from "./types";
import { unsplashPhoto } from "./images";

/**
 * Generic, descriptive stay entries — not real named hotel brands. No
 * accommodation partnership has been confirmed; see partners.ts.
 */
export const stays: Stay[] = [
  {
    slug: "midtown-skyline-hotel",
    name: "Five-Star Midtown Hotel with Skyline Views",
    category: "Luxury Hotels",
    destinationSlug: "new-york",
    heroImage: unsplashPhoto("1609945648638-cefddce6e6d8"),
    description: "A well-located Midtown property with skyline-facing rooms and easy access to the museum district.",
  },
  {
    slug: "left-bank-boutique",
    name: "Elegant Left Bank Hotel",
    category: "Boutique Hotels",
    destinationSlug: "paris",
    heroImage: unsplashPhoto("1646355798343-75c4194b59c7"),
    description: "A quietly luxurious hotel on the Left Bank, walkable to the Musée d'Orsay and Saint-Germain.",
  },
  {
    slug: "caldera-view-suites",
    name: "Caldera-View Suites with Private Plunge Pools",
    category: "Resorts",
    destinationSlug: "santorini",
    heroImage: unsplashPhoto("1672622851784-0dbd3df4c088"),
    description: "Cliffside suites in Oia with uninterrupted caldera views, most with a private plunge pool.",
  },
  {
    slug: "chianti-countryside-villa",
    name: "Restored Countryside Villa in Chianti",
    category: "Villas",
    destinationSlug: "florence",
    heroImage: unsplashPhoto("1756365951512-b15739bfbf4c"),
    description: "A private villa among Chianti's vineyards, suited to families and small groups wanting space.",
  },
  {
    slug: "central-park-family-suites",
    name: "Family Suites Near Central Park",
    category: "Family-Friendly Stays",
    destinationSlug: "new-york",
    heroImage: unsplashPhoto("1631499545782-7d09b3a7dcf7"),
    description: "Connecting and multi-room suites within walking distance of Central Park and the museum mile.",
  },
  {
    slug: "riad-marrakech-medina",
    name: "Restored Riad in the Marrakech Medina",
    category: "Cultural-Located Stays",
    destinationSlug: "marrakech",
    heroImage: unsplashPhoto("1628642004970-1da51c8c7dec"),
    description: "A traditional riad with a private courtyard, steps from the souks and Jemaa el-Fnaa.",
  },
  {
    slug: "overwater-villa-maldives",
    name: "Overwater Villa with Private Pool",
    category: "Resorts",
    destinationSlug: "maldives",
    heroImage: unsplashPhoto("1590523277543-a94d2e4eb00b"),
    description: "A private overwater villa with direct lagoon access and a plunge pool over the reef.",
  },
  {
    slug: "kyoto-ryokan-onsen",
    name: "Traditional Ryokan with Private Onsen",
    category: "Cultural-Located Stays",
    destinationSlug: "kyoto",
    heroImage: unsplashPhoto("1682787283049-d37de81646b4"),
    description: "A traditional ryokan near Gion, with kaiseki dinners served in-room and a private onsen bath.",
  },
  {
    slug: "cape-winelands-estate-lodge",
    name: "Winelands Estate Lodge",
    category: "Boutique Hotels",
    destinationSlug: "cape-town",
    heroImage: unsplashPhoto("1489676138048-ba1786a7f026"),
    description: "A small estate lodge among Stellenbosch's vineyards, with vineyard views from every room.",
  },
  {
    slug: "safari-luxury-tented-camp",
    name: "Luxury Tented Safari Camp",
    category: "Resorts",
    destinationSlug: "nairobi",
    heroImage: unsplashPhoto("1535759554012-8cbbc491f0b7"),
    description: "A small luxury tented camp within the Masai Mara, with private guiding and full-board dining.",
  },
  {
    slug: "harbor-hotel-sydney",
    name: "Harbor-View Hotel Near Circular Quay",
    category: "Luxury Hotels",
    destinationSlug: "sydney",
    heroImage: unsplashPhoto("1590716209211-ea74d5f63573"),
    description: "A harbor-facing hotel within walking distance of the Opera House and Circular Quay.",
  },
  {
    slug: "ubud-private-pool-villa",
    name: "Private Pool Villa in Ubud",
    category: "Villas",
    destinationSlug: "bali",
    heroImage: unsplashPhoto("1675657144361-98ae33e6b6f9"),
    description: "A private villa set among rice terraces, with daily housekeeping and an in-villa pool.",
  },
  {
    slug: "river-cruise-balcony-stateroom",
    name: "Balcony Stateroom, Rhine River Vessel",
    category: "Cruise Accommodation",
    destinationSlug: "amsterdam",
    heroImage: unsplashPhoto("1772292192270-862979c924c8"),
    description: "A private-balcony stateroom aboard a boutique river vessel sailing the Rhine.",
  },
  {
    slug: "beachfront-resort-zanzibar",
    name: "Beachfront Resort, Northeast Coast",
    category: "Resorts",
    destinationSlug: "zanzibar",
    heroImage: unsplashPhoto("1760429613920-97150368ed79"),
    description: "A beachfront resort on Zanzibar's quieter northeast coast, with direct beach access.",
  },
];

export function staysForDestination(slug: string) {
  return stays.filter((s) => s.destinationSlug === slug);
}
