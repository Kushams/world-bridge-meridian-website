import { themeImage } from "./images";

/**
 * Real, currently-running (or clearly upcoming) exhibitions and art fairs at
 * major galleries, museums and fairs worldwide — researched and verified
 * against each institution's own website before being added here.
 *
 * IMPORTANT — this content goes stale on its own: shows close, dates shift,
 * fairs get rescheduled. This is a static site with no live backend, so
 * nothing here updates itself. `LAST_VERIFIED` records when this list was
 * last checked against primary sources; each entry also links straight back
 * to the institution's own page so a visitor (or we) can always confirm the
 * current state before planning travel around it. Re-verify and refresh
 * this file periodically — do not let it silently go years out of date.
 *
 * We are not affiliated or partnered with any gallery, museum or fair listed
 * here — this is public information about what's on, presented because we
 * can help clients plan travel around it, not because of any relationship
 * with the institution.
 */

export const LAST_VERIFIED = "2026-08-23";

export interface ArtListing {
  slug: string;
  category: "gallery" | "museum" | "fair";
  title: string;
  venue: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  heroImage: string;
}

export const artListings: ArtListing[] = [
  // ---------------------------------------------------------------- Gallery exhibitions
  {
    slug: "dan-flavin-grids-david-zwirner-hong-kong",
    category: "gallery",
    title: "Dan Flavin: Grids",
    venue: "David Zwirner, Hong Kong",
    city: "Hong Kong",
    country: "Hong Kong",
    startDate: "2026-05-28",
    endDate: "2026-09-12",
    description:
      "A survey of Dan Flavin's grid-based fluorescent light works at David Zwirner's Hong Kong space.",
    sourceUrl: "https://www.davidzwirner.com/exhibitions",
    sourceLabel: "davidzwirner.com",
    heroImage: themeImage("culturalHeritage", 8),
  },
  {
    slug: "francesca-woodman-gagosian-rome",
    category: "gallery",
    title: "Francesca Woodman: Lately I Find a Sliver of Mirror Is Simply to Slice an Eyelid",
    venue: "Gagosian, Rome",
    city: "Rome",
    country: "Italy",
    startDate: "2026-04-29",
    endDate: "2026-09-12",
    description:
      "Nearly fifty prints by Francesca Woodman (1958–1981), many exhibited for the first time, at Gagosian's Rome gallery.",
    sourceUrl:
      "https://gagosian.com/exhibitions/2026/francesca-woodman-lately-i-find-a-sliver-of-mirror-is-simply-to-slice-an-eyelid/",
    sourceLabel: "gagosian.com",
    heroImage: themeImage("culturalHeritage", 3),
  },
  {
    slug: "georg-baselitz-white-cube-bermondsey",
    category: "gallery",
    title: "Georg Baselitz: Back Again",
    venue: "White Cube Bermondsey",
    city: "London",
    country: "United Kingdom",
    startDate: "2026-06-10",
    endDate: "2026-08-30",
    description: "New paintings from Georg Baselitz at White Cube's Bermondsey gallery in London.",
    sourceUrl: "https://www.whitecube.com/exhibitions/london",
    sourceLabel: "whitecube.com",
    heroImage: themeImage("culturalHeritage", 11),
  },
  {
    slug: "charles-gaines-hauser-wirth-paris",
    category: "gallery",
    title: "Charles Gaines: Ciphering African Acacias and Supreme Court Decisions",
    venue: "Hauser & Wirth, Paris",
    city: "Paris",
    country: "France",
    startDate: "2026-06-10",
    endDate: "2026-09-26",
    description: "New work from Charles Gaines's ongoing series pairing systems of nature with systems of law.",
    sourceUrl: "https://www.hauserwirth.com/hauser-wirth-exhibitions/",
    sourceLabel: "hauserwirth.com",
    heroImage: themeImage("culturalHeritage", 1),
  },
  {
    slug: "david-byrne-pace-new-york",
    category: "gallery",
    title: "David Byrne: Stairwell Drawings",
    venue: "Pace Gallery, New York",
    city: "New York",
    country: "United States",
    startDate: "2025-04-10",
    endDate: "2026-12-31",
    description:
      "A long-running installation of David Byrne's stairwell drawings at Pace Gallery's New York space.",
    sourceUrl: "https://www.pacegallery.com/exhibitions/",
    sourceLabel: "pacegallery.com",
    heroImage: themeImage("culturalHeritage", 9),
  },

  // ---------------------------------------------------------------- Museum exhibitions
  {
    slug: "frida-and-diego-moma",
    category: "museum",
    title: "Frida and Diego: The Last Dream",
    venue: "Museum of Modern Art (MoMA)",
    city: "New York",
    country: "United States",
    startDate: "2026-03-21",
    endDate: "2026-09-12",
    description: "MoMA brings together the late work of Frida Kahlo and Diego Rivera.",
    sourceUrl: "https://press.moma.org/exhibitions/",
    sourceLabel: "moma.org",
    heroImage: themeImage("culturalHeritage", 4),
  },
  {
    slug: "ana-mendieta-tate-modern",
    category: "museum",
    title: "Ana Mendieta",
    venue: "Tate Modern",
    city: "London",
    country: "United Kingdom",
    startDate: "2026-07-15",
    endDate: "2027-01-17",
    description:
      "A major survey of Ana Mendieta's 'earth-body' works, including the landmark Silueta Series alongside remastered films, drawings and late sculptures.",
    sourceUrl: "https://www.tate.org.uk/whats-on?venue=tate-modern&type=exhibition",
    sourceLabel: "tate.org.uk",
    heroImage: themeImage("culturalHeritage", 0),
  },
  {
    slug: "guggenheim-pop-1960-to-now",
    category: "museum",
    title: "Guggenheim Pop: 1960 to Now",
    venue: "Solomon R. Guggenheim Museum",
    city: "New York",
    country: "United States",
    startDate: "2026-06-05",
    endDate: "2027-01-10",
    description:
      "A global history of Pop art from Warhol to Cattelan, spanning 29 artists including Lichtenstein, Kusama and Oldenburg.",
    sourceUrl: "https://www.guggenheim.org/exhibition/guggenheim-pop",
    sourceLabel: "guggenheim.org",
    heroImage: themeImage("culturalHeritage", 5),
  },
  {
    slug: "primeval-waters-louvre",
    category: "museum",
    title: "Primeval Waters: Lessons from Mesopotamia",
    venue: "Musée du Louvre",
    city: "Paris",
    country: "France",
    startDate: "2026-05-20",
    endDate: "2027-03-15",
    description: "An exploration of ancient Mesopotamia and the invention of irrigation, across the Sully and Richelieu wings.",
    sourceUrl: "https://presse.louvre.fr/?p=1063000232297",
    sourceLabel: "louvre.fr",
    heroImage: themeImage("culturalHeritage", 6),
  },

  // ---------------------------------------------------------------- Art fairs
  {
    slug: "frieze-london-2026",
    category: "fair",
    title: "Frieze London & Frieze Masters",
    venue: "The Regent's Park",
    city: "London",
    country: "United Kingdom",
    startDate: "2026-10-14",
    endDate: "2026-10-18",
    description: "London's flagship contemporary and historical art fairs, running side by side in The Regent's Park.",
    sourceUrl: "https://www.frieze.com/fairs/frieze-london-frieze-masters",
    sourceLabel: "frieze.com",
    heroImage: themeImage("culturalHeritage", 2),
  },
  {
    slug: "art-basel-paris-2026",
    category: "fair",
    title: "Art Basel Paris",
    venue: "Grand Palais",
    city: "Paris",
    country: "France",
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    description: "Art Basel's Paris edition, held at the Grand Palais.",
    sourceUrl: "https://www.artbasel.com/paris",
    sourceLabel: "artbasel.com",
    heroImage: themeImage("culturalHeritage", 10),
  },
  {
    slug: "art-basel-miami-beach-2026",
    category: "fair",
    title: "Art Basel Miami Beach",
    venue: "Miami Beach Convention Center",
    city: "Miami",
    country: "United States",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    description: "Art Basel's flagship US edition, closing out the fair calendar year in Miami Beach.",
    sourceUrl: "https://www.artbasel.com/miami-beach",
    sourceLabel: "artbasel.com",
    heroImage: themeImage("culturalHeritage", 12),
  },
];

export function listingsByCategory(category: ArtListing["category"]) {
  return artListings
    .filter((l) => l.category === category)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}
