import { themeImage } from "./images";

/**
 * Real, officially-dated events across sport, entertainment, industry,
 * design, film, fashion and food/drink — researched against each event's
 * own website or organizer (not guessed) before being added here. Same
 * sourcing standard as src/data/exhibitions.ts: every entry links straight
 * back to a primary source, and this file goes stale the same way that one
 * does — dates can shift, so re-verify periodically rather than trusting it
 * indefinitely.
 *
 * We are not affiliated with any event, organizer or venue listed here.
 */

export const EVENTS_LAST_VERIFIED = "2026-08-23";

export type EventCategory =
  | "convention"
  | "professional"
  | "sporting"
  | "music-festival"
  | "food-wine"
  | "tech"
  | "film"
  | "design"
  | "fashion";

export const eventCategoryLabels: Record<EventCategory, string> = {
  convention: "Conventions & Pop Culture",
  professional: "Professional & Industry",
  sporting: "Sporting Events",
  "music-festival": "Music Festivals",
  "food-wine": "Food, Drink & Wine",
  tech: "Technology",
  film: "Film",
  design: "Design",
  fashion: "Fashion",
};

export interface WorldEvent {
  slug: string;
  category: EventCategory;
  title: string;
  organizer: string;
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

export const worldEvents: WorldEvent[] = [
  // ---------------------------------------------------------------- Conventions & pop culture
  {
    slug: "san-diego-comic-con-2026",
    category: "convention",
    title: "San Diego Comic-Con 2026",
    organizer: "Comic-Con International",
    venue: "San Diego Convention Center",
    city: "San Diego",
    country: "United States",
    startDate: "2026-07-22",
    endDate: "2026-07-26",
    description:
      "The original and largest pop culture convention, drawing publishers, studios and fans for panels, screenings and the show floor across comics, film, TV and gaming.",
    sourceUrl: "https://www.comic-con.org/",
    sourceLabel: "comic-con.org",
    heroImage: themeImage("cityscape", 3),
  },
  {
    slug: "san-diego-comic-con-2027",
    category: "convention",
    title: "San Diego Comic-Con 2027",
    organizer: "Comic-Con International",
    venue: "San Diego Convention Center",
    city: "San Diego",
    country: "United States",
    startDate: "2027-07-21",
    endDate: "2027-07-25",
    description:
      "The 2027 edition, with Preview Night on July 21 ahead of four full convention days — the same panels, screenings and show floor that make it the industry's flagship pop culture event.",
    sourceUrl: "https://www.comic-con.org/",
    sourceLabel: "comic-con.org",
    heroImage: themeImage("cityscape", 3),
  },
  {
    slug: "new-york-comic-con-2026",
    category: "convention",
    title: "New York Comic Con 2026",
    organizer: "ReedPop",
    venue: "Jacob K. Javits Center",
    city: "New York",
    country: "United States",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    description:
      "New York's answer to San Diego — comics, television, film and gaming programming across the Javits Center, with major studio panels and a packed artist alley.",
    sourceUrl: "https://www.newyorkcomiccon.com/",
    sourceLabel: "newyorkcomiccon.com",
    heroImage: themeImage("cityscape", 6),
  },

  // ---------------------------------------------------------------- Professional & industry
  {
    slug: "nursecon-at-sea-2026",
    category: "professional",
    title: "NurseCon at Sea 2026",
    organizer: "NurseCon at Sea",
    venue: "Celebrity Reflection, round-trip from Port Everglades",
    city: "Fort Lauderdale",
    country: "United States",
    startDate: "2026-04-27",
    endDate: "2026-05-01",
    description:
      "A continuing-education conference for nurses held aboard a cruise ship, sailing round-trip from Fort Lauderdale to Ocho Rios, Jamaica, combining accredited CE sessions with time at sea.",
    sourceUrl: "https://nurseconatsea.com/",
    sourceLabel: "nurseconatsea.com",
    heroImage: themeImage("cruiseAndSea", 0),
  },

  // ---------------------------------------------------------------- Sporting events
  {
    slug: "wimbledon-2026",
    category: "sporting",
    title: "The Championships, Wimbledon 2026",
    organizer: "All England Lawn Tennis Club",
    venue: "All England Club",
    city: "London",
    country: "United Kingdom",
    startDate: "2026-06-29",
    endDate: "2026-07-12",
    description:
      "The oldest tennis tournament in the world and the only Grand Slam still played on grass, at the All England Club in Wimbledon.",
    sourceUrl: "https://www.wimbledon.com/",
    sourceLabel: "wimbledon.com",
    heroImage: themeImage("mountainNature", 5),
  },
  {
    slug: "wimbledon-2027",
    category: "sporting",
    title: "The Championships, Wimbledon 2027",
    organizer: "All England Lawn Tennis Club",
    venue: "All England Club",
    city: "London",
    country: "United Kingdom",
    startDate: "2027-06-28",
    endDate: "2027-07-11",
    description:
      "Two weeks of grass-court tennis at the All England Club, with the finals expected the second weekend.",
    sourceUrl: "https://www.wimbledon.com/",
    sourceLabel: "wimbledon.com",
    heroImage: themeImage("mountainNature", 5),
  },
  {
    slug: "tcs-new-york-city-marathon-2026",
    category: "sporting",
    title: "TCS New York City Marathon 2026",
    organizer: "New York Road Runners (NYRR)",
    venue: "Staten Island to Central Park (five-borough course)",
    city: "New York",
    country: "United States",
    startDate: "2026-11-01",
    endDate: "2026-11-01",
    description:
      "The world's largest marathon by finishers, running through all five boroughs of New York City — the 2026 edition marks 50 years of the current course.",
    sourceUrl: "https://www.nyrr.org/tcsnycmarathon",
    sourceLabel: "nyrr.org",
    heroImage: themeImage("adventure", 3),
  },
  {
    slug: "the-masters-2027",
    category: "sporting",
    title: "The Masters 2027",
    organizer: "Augusta National Golf Club",
    venue: "Augusta National Golf Club",
    city: "Augusta",
    country: "United States",
    startDate: "2027-04-08",
    endDate: "2027-04-11",
    description:
      "Golf's first major of the year, played every spring at Augusta National — tournament rounds run Thursday to Sunday, with practice rounds and the Par 3 Contest earlier in the week.",
    sourceUrl: "https://www.masters.com/",
    sourceLabel: "masters.com",
    heroImage: themeImage("mountainNature", 7),
  },
  {
    slug: "monaco-grand-prix-2027",
    category: "sporting",
    title: "Formula 1 Monaco Grand Prix 2027",
    organizer: "Automobile Club de Monaco / Formula 1",
    venue: "Circuit de Monaco",
    city: "Monaco",
    country: "Monaco",
    startDate: "2027-06-03",
    endDate: "2027-06-06",
    description:
      "Formula 1's most storied race, run through the streets of Monte Carlo — the race itself is scheduled for Sunday, June 6, opening the European leg of the season.",
    sourceUrl: "https://acm.mc/en/epreuves/formula-1-grand-prix-de-monaco/",
    sourceLabel: "acm.mc",
    heroImage: themeImage("coastal", 1),
  },

  // ---------------------------------------------------------------- Music festivals
  {
    slug: "coachella-2026",
    category: "music-festival",
    title: "Coachella Valley Music and Arts Festival 2026",
    organizer: "Goldenvoice",
    venue: "Empire Polo Club",
    city: "Indio, California",
    country: "United States",
    startDate: "2026-04-10",
    endDate: "2026-04-19",
    description:
      "One of the world's best-known music festivals, held across two consecutive weekends in the desert outside Palm Springs.",
    sourceUrl: "https://www.coachella.com/",
    sourceLabel: "coachella.com",
    heroImage: themeImage("mountainNature", 2),
  },
  {
    slug: "coachella-2027",
    category: "music-festival",
    title: "Coachella Valley Music and Arts Festival 2027",
    organizer: "Goldenvoice",
    venue: "Empire Polo Club",
    city: "Indio, California",
    country: "United States",
    startDate: "2027-04-09",
    endDate: "2027-04-18",
    description:
      "The 2027 edition returns across two weekends (April 9–11 and 16–18) at the Empire Polo Club.",
    sourceUrl: "https://www.coachella.com/",
    sourceLabel: "coachella.com",
    heroImage: themeImage("mountainNature", 2),
  },

  // ---------------------------------------------------------------- Food, drink & wine
  {
    slug: "oktoberfest-2026",
    category: "food-wine",
    title: "Oktoberfest 2026",
    organizer: "City of Munich",
    venue: "Theresienwiese",
    city: "Munich",
    country: "Germany",
    startDate: "2026-09-19",
    endDate: "2026-10-04",
    description:
      "The 191st Oktoberfest — 16 days of beer tents, traditional food and Bavarian festivity on the Theresienwiese, the world's largest folk festival.",
    sourceUrl: "https://www.oktoberfest.de/en",
    sourceLabel: "oktoberfest.de",
    heroImage: themeImage("foodAndWine", 3),
  },

  // ---------------------------------------------------------------- Technology
  {
    slug: "ces-2027",
    category: "tech",
    title: "CES 2027",
    organizer: "Consumer Technology Association",
    venue: "Las Vegas Convention Center",
    city: "Las Vegas",
    country: "United States",
    startDate: "2027-01-06",
    endDate: "2027-01-09",
    description:
      "The world's largest consumer technology trade show, with overflow exhibits at the Venetian Expo and Resorts World alongside the main convention center.",
    sourceUrl: "https://www.ces.tech/",
    sourceLabel: "ces.tech",
    heroImage: themeImage("business", 1),
  },

  // ---------------------------------------------------------------- Film
  {
    slug: "cannes-film-festival-2027",
    category: "film",
    title: "Festival de Cannes 2027",
    organizer: "Festival de Cannes",
    venue: "Palais des Festivals",
    city: "Cannes",
    country: "France",
    startDate: "2027-05-11",
    endDate: "2027-05-22",
    description:
      "The 80th edition of the world's most prestigious film festival, running along the Croisette with red-carpet premieres and the Palme d'Or competition.",
    sourceUrl: "https://www.festival-cannes.com/en/",
    sourceLabel: "festival-cannes.com",
    heroImage: themeImage("coastal", 3),
  },

  // ---------------------------------------------------------------- Design
  {
    slug: "salone-del-mobile-2027",
    category: "design",
    title: "Salone del Mobile.Milano 2027 (Milan Design Week)",
    organizer: "Salone del Mobile.Milano",
    venue: "Rho Fiera Milano",
    city: "Milan",
    country: "Italy",
    startDate: "2027-04-13",
    endDate: "2027-04-18",
    description:
      "The 65th edition of the world's leading furniture and design fair, anchoring Milan Design Week with showroom events across the city.",
    sourceUrl: "https://www.salonemilano.it/en",
    sourceLabel: "salonemilano.it",
    heroImage: themeImage("culturalHeritage", 8),
  },

  // ---------------------------------------------------------------- Fashion
  {
    slug: "paris-haute-couture-fw-2027",
    category: "fashion",
    title: "Paris Haute Couture Fashion Week, FW 2027",
    organizer: "Fédération de la Haute Couture et de la Mode (FHCM)",
    venue: "Venues across Paris",
    city: "Paris",
    country: "France",
    startDate: "2027-01-25",
    endDate: "2027-01-28",
    description:
      "The official Haute Couture calendar for Fall/Winter 2027–28, staged across the maisons and venues of Paris.",
    sourceUrl: "https://www.fhcm.paris/en/paris-fashion-week/calendar",
    sourceLabel: "fhcm.paris",
    heroImage: themeImage("cityscape", 0),
  },
  {
    slug: "paris-womenswear-fw-2027",
    category: "fashion",
    title: "Paris Fashion Week Womenswear, FW 2027",
    organizer: "Fédération de la Haute Couture et de la Mode (FHCM)",
    venue: "Venues across Paris",
    city: "Paris",
    country: "France",
    startDate: "2027-03-01",
    endDate: "2027-03-09",
    description:
      "Ready-to-wear runway shows for Fall/Winter 2027–28, closing out the month-long global fashion month circuit.",
    sourceUrl: "https://www.fhcm.paris/en/paris-fashion-week/calendar",
    sourceLabel: "fhcm.paris",
    heroImage: themeImage("cityscape", 1),
  },
];

export function worldEventsByCategory(category: EventCategory) {
  return worldEvents.filter((e) => e.category === category);
}
