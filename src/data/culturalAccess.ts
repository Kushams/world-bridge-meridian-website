import { themeImage } from "./images";

/**
 * Real, independent membership / patron programs run directly by major
 * museums and opera & ballet companies — not something World Bridge
 * Meridian is affiliated with, sells, or has any relationship to. They're
 * listed here because they're a genuine part of how serious travelers
 * experience these institutions (private views, curator-led tours,
 * backstage access, priority booking), and a client interested in one is
 * exactly the kind of client whose trip we're well suited to build.
 *
 * Every entry links straight back to the institution's own membership page.
 * Fees, tiers and benefits change — always confirm current terms there
 * before joining or traveling around a program.
 */

export const CULTURAL_ACCESS_LAST_VERIFIED = "2026-08-24";

export interface CulturalAccessProgram {
  slug: string;
  category: "museum" | "opera-ballet";
  programName: string;
  institution: string;
  city: string;
  country: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  heroImage: string;
}

export const culturalAccessPrograms: CulturalAccessProgram[] = [
  // ---------------------------------------------------------------- Museums
  {
    slug: "met-patrons-circle",
    category: "museum",
    programName: "Patrons Circle & Apollo Circle",
    institution: "The Metropolitan Museum of Art",
    city: "New York",
    country: "United States",
    description:
      "The Met's patron-level membership tiers open onto curator-led tours, opening receptions and behind-the-scenes programming; the Apollo Circle is its dedicated group for younger patrons in their twenties and thirties.",
    sourceUrl: "https://engage.metmuseum.org/members/patrons-circle/",
    sourceLabel: "engage.metmuseum.org",
    heroImage: themeImage("culturalHeritage", 8),
  },
  {
    slug: "tate-patrons",
    category: "museum",
    programName: "Tate Patrons",
    institution: "Tate (Tate Modern & Tate Britain)",
    city: "London",
    country: "United Kingdom",
    description:
      "Across four membership tiers, Tate Patrons get curator-led exhibition tours, visits to artists' studios and private collections, London private views, and invitations to receptions and international art trips.",
    sourceUrl: "https://www.tate.org.uk/join-support/tate-patrons",
    sourceLabel: "tate.org.uk",
    heroImage: themeImage("culturalHeritage", 3),
  },
  {
    slug: "societe-amis-du-louvre",
    category: "museum",
    programName: "Société des Amis du Louvre",
    institution: "Musée du Louvre",
    city: "Paris",
    country: "France",
    description:
      "An independent society founded in 1897 with more than 65,000 members today, funding acquisitions for the Louvre. Membership gives unlimited access to the museum without reservation; higher giving levels join the Cercle des Mécènes patron circle. An American Friends of the Louvre program exists for US-based supporters.",
    sourceUrl: "https://www.amisdulouvre.fr/",
    sourceLabel: "amisdulouvre.fr",
    heroImage: themeImage("culturalHeritage", 1),
  },
  {
    slug: "friends-of-the-uffizi",
    category: "museum",
    programName: "Friends of the Uffizi Gallery",
    institution: "Gallerie degli Uffizi",
    city: "Florence",
    country: "Italy",
    description:
      "The US-based sister organization to Florence's own Amici degli Uffizi, raising funds for the Uffizi's acquisitions, restorations and exhibitions and offering members a direct connection to the museum's program of events.",
    sourceUrl: "https://friendsoftheuffizigallery.org/",
    sourceLabel: "friendsoftheuffizigallery.org",
    heroImage: themeImage("culturalHeritage", 4),
  },
  {
    slug: "american-friends-of-the-prado",
    category: "museum",
    programName: "American Friends of the Prado Museum",
    institution: "Museo Nacional del Prado",
    city: "Madrid",
    country: "Spain",
    description:
      "A US-based support organization for the Prado offering tiered membership — from general entry through the museum's dedicated Puerta de Amigos to guided-visit access at higher levels — alongside Spain's own Fundación Amigos del Museo del Prado.",
    sourceUrl: "https://www.afpradomuseum.org/membership",
    sourceLabel: "afpradomuseum.org",
    heroImage: themeImage("culturalHeritage", 8),
  },

  // ---------------------------------------------------------------- Opera & ballet
  {
    slug: "amici-della-scala",
    category: "opera-ballet",
    programName: "Amici della Scala",
    institution: "Teatro alla Scala",
    city: "Milan",
    country: "Italy",
    description:
      "Founded in 1978 to support Teatro alla Scala, Amici della Scala runs the long-running Prima delle Prime series — talks introducing each opera and ballet of the season — alongside exhibitions and preservation projects for the theater's archives.",
    sourceUrl: "https://www.amicidellascala.it/?lang=en",
    sourceLabel: "amicidellascala.it",
    heroImage: themeImage("culturalHeritage", 9),
  },
  {
    slug: "royal-ballet-and-opera-patrons",
    category: "opera-ballet",
    programName: "Royal Ballet and Opera Patrons",
    institution: "Royal Ballet and Opera, Covent Garden",
    city: "London",
    country: "United Kingdom",
    description:
      "The Royal Ballet and Opera's patron program (formerly the Royal Opera House) gives priority booking, guaranteed first-night seats and, at higher tiers, a private backstage tour for the member and their guests.",
    sourceUrl: "https://www.rbo.org.uk/join-and-support/royal-ballet-and-opera-patrons",
    sourceLabel: "rbo.org.uk",
    heroImage: themeImage("culturalHeritage", 4),
  },
  {
    slug: "vienna-state-opera-circle-of-friends",
    category: "opera-ballet",
    programName: "Official Circle of Friends of the Vienna State Opera",
    institution: "Wiener Staatsoper",
    city: "Vienna",
    country: "Austria",
    description:
      "Membership from as little as €120 a year gives right of first refusal on tickets across the season plus free admission to the house's artistic-life events; a separate Friends of the Vienna State Ballet program adds artist talks and rehearsal visits.",
    sourceUrl: "https://www.wiener-staatsoper.at/en/ocof/",
    sourceLabel: "wiener-staatsoper.at",
    heroImage: themeImage("culturalHeritage", 9),
  },
];

export function culturalAccessByCategory(category: CulturalAccessProgram["category"]) {
  return culturalAccessPrograms.filter((p) => p.category === category);
}
