import { themeImage, unsplashPhoto } from "./images";

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

export const EVENTS_LAST_VERIFIED = "2026-10-10";

export type EventCategory =
  | "convention"
  | "professional"
  | "sporting"
  | "music-festival"
  | "food-wine"
  | "tech"
  | "film"
  | "design"
  | "fashion"
  | "cultural";

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
  cultural: "Festivals & Culture",
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
    heroImage: unsplashPhoto("1783201033940-acd25eda0eac"),
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
    heroImage: unsplashPhoto("1719762888013-6ae1e96d0eb8"),
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
    heroImage: unsplashPhoto("1785016680667-bca44158204e"),
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
    heroImage: unsplashPhoto("1777684862302-7c0973a30095"),
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
    heroImage: unsplashPhoto("1778914835544-4af67f7280df"),
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
    heroImage: unsplashPhoto("1751042265458-cfad0040a5de"),
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
    heroImage: unsplashPhoto("1760039756619-94cf22850ae0"),
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
    heroImage: unsplashPhoto("1736766920028-ee18c15c02ac"),
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

  // ---------------------------------------------------------------- Upcoming highlights around the world (added 2026-10-10)
  {
    slug: "f1-singapore-gp-2026",
    category: "sporting",
    title: "Formula 1 Singapore Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Marina Bay Street Circuit",
    city: "Singapore",
    country: "Singapore",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    description:
      "A night race through the streets around Marina Bay, one of the most distinctive rounds of the Formula 1 World Championship.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1699138346782-8a8b211c3da2"),
  },
  {
    slug: "f1-united-states-gp-2026",
    category: "sporting",
    title: "Formula 1 United States Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Circuit of the Americas",
    city: "Austin",
    country: "United States",
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    description:
      "The Formula 1 World Championship returns to Texas for the United States Grand Prix weekend at Circuit of the Americas.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1588993608283-7f0eda4438be"),
  },
  {
    slug: "f1-mexico-city-gp-2026",
    category: "sporting",
    title: "Formula 1 Mexico City Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Autódromo Hermanos Rodríguez",
    city: "Mexico City",
    country: "Mexico",
    startDate: "2026-10-30",
    endDate: "2026-11-01",
    description:
      "Gran Premio de la Ciudad de México — a high-altitude round of the Formula 1 season in one of the sport's most atmospheric crowds.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1521216774850-01bc1c5fe0da"),
  },
  {
    slug: "f1-sao-paulo-gp-2026",
    category: "sporting",
    title: "Formula 1 São Paulo Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Autódromo José Carlos Pace (Interlagos)",
    city: "São Paulo",
    country: "Brazil",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    description:
      "The Brazilian round of the Formula 1 World Championship, staged at Interlagos in São Paulo.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1645918899630-85e2f3132a84"),
  },
  {
    slug: "f1-las-vegas-gp-2026",
    category: "sporting",
    title: "Formula 1 Las Vegas Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Las Vegas Strip Circuit",
    city: "Las Vegas",
    country: "United States",
    startDate: "2026-11-19",
    endDate: "2026-11-21",
    description:
      "A late-night Formula 1 race run on the streets of the Las Vegas Strip.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1581351721010-8cf859cb14a4"),
  },
  {
    slug: "f1-qatar-gp-2026",
    category: "sporting",
    title: "Formula 1 Qatar Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Lusail International Circuit",
    city: "Doha",
    country: "Qatar",
    startDate: "2026-11-27",
    endDate: "2026-11-29",
    description:
      "The Qatar round of the 2026 Formula 1 World Championship, held under floodlights near Doha.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1669300884869-e6e11c67c031"),
  },
  {
    slug: "f1-abu-dhabi-gp-2026",
    category: "sporting",
    title: "Formula 1 Abu Dhabi Grand Prix 2026",
    organizer: "Formula 1",
    venue: "Yas Marina Circuit",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    description:
      "The season finale of the 2026 Formula 1 World Championship at Yas Marina Circuit.",
    sourceUrl: "https://www.formula1.com/en/racing/2026",
    sourceLabel: "formula1.com",
    heroImage: unsplashPhoto("1512632578888-169bbbc64f33"),
  },
  {
    slug: "web-summit-lisbon-2026",
    category: "tech",
    title: "Web Summit Lisbon 2026",
    organizer: "Web Summit",
    venue: "Venues across Lisbon",
    city: "Lisbon",
    country: "Portugal",
    startDate: "2026-11-09",
    endDate: "2026-11-12",
    description:
      "One of the world's largest technology conferences, bringing founders, investors and executives to Lisbon.",
    sourceUrl: "https://websummit.com/",
    sourceLabel: "websummit.com",
    heroImage: unsplashPhoto("1505373877841-8d25f7d46678"),
  },
  {
    slug: "dubai-design-week-2026",
    category: "design",
    title: "Dubai Design Week 2026",
    organizer: "Dubai Design Week",
    venue: "Dubai Design District (d3)",
    city: "Dubai",
    country: "United Arab Emirates",
    startDate: "2026-11-03",
    endDate: "2026-11-08",
    description:
      "The Middle East's design festival, including the Downtown Design fair (4–8 November), across Dubai Design District.",
    sourceUrl: "https://www.dubaidesignweek.ae/",
    sourceLabel: "dubaidesignweek.ae",
    heroImage: unsplashPhoto("1651467606797-e1c660cf3fda"),
  },
  {
    slug: "edinburghs-hogmanay-2026",
    category: "cultural",
    title: "Edinburgh's Hogmanay 2026/27",
    organizer: "Edinburgh's Hogmanay",
    venue: "Venues across Edinburgh",
    city: "Edinburgh",
    country: "United Kingdom",
    startDate: "2026-12-29",
    endDate: "2026-12-31",
    description:
      "Scotland's New Year celebration: the Torchlight Procession (29 Dec), the Night Afore Party with The Fratellis (30 Dec), and the Street Party and Hogmanay in the Gardens with Underworld (31 Dec).",
    sourceUrl: "https://edwinterfest.com/hogmanay",
    sourceLabel: "edwinterfest.com",
    heroImage: unsplashPhoto("1790800267425-a95616fa82d5"),
  },
  {
    slug: "venice-carnival-2027",
    category: "cultural",
    title: "Venice Carnival 2027",
    organizer: "Città di Venezia",
    venue: "Venues across Venice",
    city: "Venice",
    country: "Italy",
    startDate: "2027-01-23",
    endDate: "2027-02-09",
    description:
      "The historic masked carnival of Venice, running from late January through to Martedì Grasso.",
    sourceUrl: "https://www.carnevale.venezia.it/en/",
    sourceLabel: "carnevale.venezia.it",
    heroImage: unsplashPhoto("1533022586528-2e09bde0959b"),
  },
  {
    slug: "new-orleans-mardi-gras-2027",
    category: "cultural",
    title: "Mardi Gras New Orleans 2027",
    organizer: "New Orleans & Company",
    venue: "Streets across New Orleans",
    city: "New Orleans",
    country: "United States",
    startDate: "2027-01-06",
    endDate: "2027-02-09",
    description:
      "Carnival season in New Orleans, from Twelfth Night on 6 January through to Mardi Gras Day (Fat Tuesday) on 9 February.",
    sourceUrl: "https://www.neworleans.com/events/holidays-seasonal/mardi-gras/",
    sourceLabel: "neworleans.com",
    heroImage: unsplashPhoto("1703145217874-47c91be335e0"),
  },
  {
    slug: "australian-open-2027",
    category: "sporting",
    title: "Australian Open 2027",
    organizer: "Tennis Australia",
    venue: "Melbourne Park",
    city: "Melbourne",
    country: "Australia",
    startDate: "2027-01-11",
    endDate: "2027-01-31",
    description:
      "The first tennis Grand Slam of the year, played at Melbourne Park.",
    sourceUrl: "https://ausopen.com/",
    sourceLabel: "ausopen.com",
    heroImage: unsplashPhoto("1514395462725-fb4566210144"),
  },
  {
    slug: "berlinale-2027",
    category: "film",
    title: "Berlinale 2027 (77th Berlin International Film Festival)",
    organizer: "Berlinale",
    venue: "Venues across Berlin",
    city: "Berlin",
    country: "Germany",
    startDate: "2027-02-10",
    endDate: "2027-02-21",
    description:
      "One of Europe's major film festivals, with competition screenings, the European Film Market and public screenings across Berlin.",
    sourceUrl: "https://www.berlinale.de/en/",
    sourceLabel: "berlinale.de",
    heroImage: unsplashPhoto("1779906904964-454d04a227a1"),
  },
  {
    slug: "mwc-barcelona-2027",
    category: "tech",
    title: "MWC Barcelona 2027",
    organizer: "GSMA",
    venue: "Fira Gran Via",
    city: "Barcelona",
    country: "Spain",
    startDate: "2027-03-01",
    endDate: "2027-03-04",
    description:
      "The mobile and connectivity industry's largest annual gathering, held at Fira Gran Via.",
    sourceUrl: "https://www.mwcbarcelona.com/",
    sourceLabel: "mwcbarcelona.com",
    heroImage: unsplashPhoto("1540575467063-178a50c2df87"),
  },
  {
    slug: "tokyo-marathon-2027",
    category: "sporting",
    title: "Tokyo Marathon 2027",
    organizer: "Tokyo Marathon Foundation",
    venue: "Central Tokyo",
    city: "Tokyo",
    country: "Japan",
    startDate: "2027-03-07",
    endDate: "2027-03-07",
    description:
      "One of the Abbott World Marathon Majors, run through central Tokyo — the 2027 race is the 20th anniversary edition.",
    sourceUrl: "https://www.marathon.tokyo/en/",
    sourceLabel: "marathon.tokyo",
    heroImage: unsplashPhoto("1682367905664-e36b30f15b19"),
  },
  {
    slug: "boston-marathon-2027",
    category: "sporting",
    title: "Boston Marathon 2027",
    organizer: "Boston Athletic Association",
    venue: "Hopkinton to Boston",
    city: "Boston",
    country: "United States",
    startDate: "2027-04-19",
    endDate: "2027-04-19",
    description:
      "The world's oldest annual marathon, run on Patriots' Day from Hopkinton into Boston.",
    sourceUrl: "https://www.baa.org/races/boston-marathon",
    sourceLabel: "baa.org",
    heroImage: unsplashPhoto("1613936360976-8f35cf0e5461"),
  },
  {
    slug: "london-marathon-2027",
    category: "sporting",
    title: "TCS London Marathon 2027",
    organizer: "London Marathon Events",
    venue: "Greenwich to The Mall",
    city: "London",
    country: "United Kingdom",
    startDate: "2027-04-24",
    endDate: "2027-04-25",
    description:
      "The 2027 TCS London Marathon spans two days for the first time, on Saturday 24 and Sunday 25 April.",
    sourceUrl: "https://www.londonmarathonevents.co.uk/london-marathon",
    sourceLabel: "londonmarathonevents.co.uk",
    heroImage: unsplashPhoto("1759674861540-afed9f86f94a"),
  },
  {
    slug: "kentucky-derby-2027",
    category: "sporting",
    title: "Kentucky Derby 2027",
    organizer: "Churchill Downs",
    venue: "Churchill Downs",
    city: "Louisville",
    country: "United States",
    startDate: "2027-04-30",
    endDate: "2027-05-01",
    description:
      "Derby & Oaks weekend at Churchill Downs, with the Kentucky Derby run on Saturday 1 May.",
    sourceUrl: "https://www.kentuckyderby.com/",
    sourceLabel: "kentuckyderby.com",
    heroImage: unsplashPhoto("1507514604110-ba3347c457f6"),
  },
  {
    slug: "cape-town-marathon-2027",
    category: "sporting",
    title: "Sanlam Cape Town Marathon 2027",
    organizer: "Cape Town Marathon",
    venue: "Central Cape Town",
    city: "Cape Town",
    country: "South Africa",
    startDate: "2027-05-22",
    endDate: "2027-05-23",
    description:
      "A world-marathon-major-level race through Cape Town between Table Mountain and the Atlantic coast, held across 22–23 May.",
    sourceUrl: "https://www.capetownmarathon.com/",
    sourceLabel: "capetownmarathon.com",
    heroImage: unsplashPhoto("1604763655221-b98ebdac6ddf"),
  },
  {
    slug: "roland-garros-2027",
    category: "sporting",
    title: "Roland-Garros 2027",
    organizer: "Fédération Française de Tennis",
    venue: "Stade Roland-Garros",
    city: "Paris",
    country: "France",
    startDate: "2027-05-17",
    endDate: "2027-06-06",
    description:
      "The clay-court Grand Slam of the tennis calendar, held at Stade Roland-Garros in Paris.",
    sourceUrl: "https://www.rolandgarros.com/en-us/",
    sourceLabel: "rolandgarros.com",
    heroImage: unsplashPhoto("1751275061697-0f3aede33696"),
  },
  {
    slug: "calgary-stampede-2027",
    category: "cultural",
    title: "Calgary Stampede 2027",
    organizer: "Calgary Stampede",
    venue: "Stampede Park",
    city: "Calgary",
    country: "Canada",
    startDate: "2027-07-09",
    endDate: "2027-07-18",
    description:
      "Ten days of rodeo, parades, music and exhibitions in Calgary, Alberta.",
    sourceUrl: "https://www.calgarystampede.com/",
    sourceLabel: "calgarystampede.com",
    heroImage: unsplashPhoto("1619368562181-1e4b3dc70570"),
  },
  {
    slug: "the-open-2027",
    category: "sporting",
    title: "The 155th Open Championship 2027",
    organizer: "The R&A",
    venue: "St Andrews (Old Course)",
    city: "St Andrews",
    country: "United Kingdom",
    startDate: "2027-07-11",
    endDate: "2027-07-18",
    description:
      "Golf's original championship returns to St Andrews, the home of golf.",
    sourceUrl: "https://www.theopen.com/",
    sourceLabel: "theopen.com",
    heroImage: unsplashPhoto("1785016680667-bca44158204e"),
  },
  {
    slug: "edinburgh-fringe-2027",
    category: "cultural",
    title: "Edinburgh Festival Fringe 2027",
    organizer: "Edinburgh Festival Fringe Society",
    venue: "Venues across Edinburgh",
    city: "Edinburgh",
    country: "United Kingdom",
    startDate: "2027-08-06",
    endDate: "2027-08-30",
    description:
      "The world's largest arts festival — the Fringe's 80th edition fills Edinburgh with theatre, comedy, music and dance.",
    sourceUrl: "https://www.edfringe.com/",
    sourceLabel: "edfringe.com",
    heroImage: unsplashPhoto("1535448033526-c0e85c9e6968"),
  },
  {
    slug: "ryder-cup-2027",
    category: "sporting",
    title: "Ryder Cup 2027",
    organizer: "Ryder Cup Europe",
    venue: "Adare Manor",
    city: "Adare (Co. Limerick)",
    country: "Ireland",
    startDate: "2027-09-13",
    endDate: "2027-09-19",
    description:
      "The centenary Ryder Cup at Adare Manor, with four build-up days (13–16 September) followed by three days of competition (17–19 September).",
    sourceUrl: "https://www.rydercup.com/",
    sourceLabel: "rydercup.com",
    heroImage: unsplashPhoto("1785016680667-bca44158204e"),
  },
  {
    slug: "oktoberfest-2027",
    category: "food-wine",
    title: "Oktoberfest 2027",
    organizer: "Stadt München",
    venue: "Theresienwiese",
    city: "Munich",
    country: "Germany",
    startDate: "2027-09-18",
    endDate: "2027-10-03",
    description:
      "The 192nd Oktoberfest, Munich's famous beer festival on the Theresienwiese.",
    sourceUrl: "https://www.oktoberfest.de/en",
    sourceLabel: "oktoberfest.de",
    heroImage: unsplashPhoto("1760039756619-94cf22850ae0"),
  },
  {
    slug: "rugby-world-cup-2027",
    category: "sporting",
    title: "Rugby World Cup 2027",
    organizer: "World Rugby",
    venue: "Host cities across Australia",
    city: "Sydney",
    country: "Australia",
    startDate: "2027-10-01",
    endDate: "2027-11-13",
    description:
      "Men's Rugby World Cup hosted across seven Australian cities, with the opening match in Perth and the final in Sydney.",
    sourceUrl: "https://www.rugbyworldcup.com/2027",
    sourceLabel: "rugbyworldcup.com",
    heroImage: unsplashPhoto("1767190937750-d6aaf8ea99d0"),
  },
  {
    slug: "dubai-airshow-2027",
    category: "professional",
    title: "Dubai Airshow 2027",
    organizer: "Dubai Airshow",
    venue: "Dubai World Central (DWC)",
    city: "Dubai",
    country: "United Arab Emirates",
    startDate: "2027-11-15",
    endDate: "2027-11-19",
    description:
      "The aerospace industry's biennial Dubai Airshow, held at Dubai World Central.",
    sourceUrl: "https://www.dubaiairshow.aero/",
    sourceLabel: "dubaiairshow.aero",
    heroImage: unsplashPhoto("1500252185289-40ca85eb23a7"),
  },
];

export function worldEventsByCategory(category: EventCategory) {
  return worldEvents.filter((e) => e.category === category);
}
