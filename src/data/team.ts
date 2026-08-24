import { TeamMember } from "./types";
import { stockPortrait, localImage } from "./images";

/**
 * Illustrative staff roster.
 *
 * Earl and Justin are World Bridge Meridian's real founder and COO. Everyone
 * else below them represents the kind of role structure a company like this
 * runs on — organized by department and reporting line — using placeholder
 * names, stock headshot photos and countries of origin at the user's
 * request, alongside a professional-focused bio (what the role actually
 * owns). Replace with real staff, real names and real photography as the
 * team is hired.
 */
export const team: TeamMember[] = [
  {
    slug: "earl-anderson",
    name: "Earl Anderson",
    title: "Founder & CEO",
    department: "Executive",
    photo: localImage("/images/earl-anderson.jpg"),
    bio: [
      "Earl Anderson founded World Bridge Meridian in 2012 with a simple belief: travel should be about how you experience a destination, not just how you get there.",
      "Originally from Croatia, Earl brings a genuinely international perspective to the company — built from the start around bringing together destinations, accommodations, partners and itinerary planning around each individual traveler, rather than selling standardized packages.",
      "Earl continues to be closely involved in the company's client relationships and the standards it holds its journeys to.",
    ],
    focusAreas: ["Company direction and standards", "Key client relationships", "Founding vision and growth"],
  },
  {
    slug: "justin-warkovsky",
    name: "Justin Warkovsky",
    title: "Chief Operating Officer",
    department: "Executive",
    photo: localImage("/images/justin-warkovsky.jpg"),
    bio: [
      "Justin Warkovsky oversees World Bridge Meridian's day-to-day operations — the supplier relationships, logistics and internal standards that keep every journey running smoothly behind the scenes.",
      "Originally from Poland, Justin works closely with Earl to make sure the company's operations keep pace with its growth without losing the personal attention each journey is built on.",
    ],
    focusAreas: ["Day-to-day operations", "Supplier relationships", "Internal standards and process"],
  },

  // ---------------------------------------------------------------- Directors
  {
    slug: "claire-dunmore",
    name: "Claire Dunmore",
    title: "Director of Travel Design",
    department: "Travel Design & Experience",
    reportsToSlug: "justin-warkovsky",
    photo: stockPortrait("1685760259914-ee8d2c92d2e0"),
    bio: [
      "Claire leads the team that turns a client's first conversation with World Bridge Meridian into an actual itinerary — destinations, pacing, accommodation style and the experiences woven through each day.",
      "Originally from Australia, Claire joined the travel design team early on and has shaped much of how it operates today.",
      "She sets the standard every journey is designed against before it reaches a client: nothing goes out that the design team wouldn't book for their own family.",
    ],
    focusAreas: ["Itinerary design standards", "Travel coordination team", "Package and cruise design review"],
  },
  {
    slug: "lucas-ferreira",
    name: "Lucas Ferreira",
    title: "Director of Operations & Supplier Relations",
    department: "Operations",
    reportsToSlug: "justin-warkovsky",
    photo: stockPortrait("1652471943570-f3590a4e52ed"),
    bio: [
      "Lucas runs the operational side of the business — the flight and ground logistics, supplier contracts, and documentation processes that have to work correctly every single time.",
      "Originally from Brazil, Lucas came to World Bridge Meridian from a background in hotel operations and supplier-side logistics.",
      "He negotiates and maintains the working relationships with the hotels, ground handlers and transport partners that World Bridge Meridian's journeys depend on.",
    ],
    focusAreas: ["Flight and ground logistics", "Supplier and partner relationships", "Documentation processes"],
  },
  {
    slug: "rachel-hendricks",
    name: "Rachel Hendricks",
    title: "Director of Client Experience",
    department: "Client Experience",
    reportsToSlug: "justin-warkovsky",
    photo: stockPortrait("1573496359142-b8d87734a5a2"),
    bio: [
      "Rachel owns the relationship with every client from the moment a journey is confirmed through to the day they're back home — the point of contact if a flight changes, a plan shifts, or something simply needs handling.",
      "Originally from the Netherlands, Rachel has spent most of her career on the client-facing side of travel, from tour operations to direct account management.",
      "She built the client experience team around a single rule: a traveler should never have to solve a problem on their own mid-trip.",
    ],
    focusAreas: ["Client experience team", "In-trip support standards", "Post-journey follow-up"],
  },
  {
    slug: "daniel-hoffmann",
    name: "Daniel Hoffmann",
    title: "Finance Director",
    department: "Finance",
    reportsToSlug: "earl-anderson",
    photo: stockPortrait("1519085360753-af0119f7cbe7"),
    bio: [
      "Daniel oversees World Bridge Meridian's finances — from indicative pricing on new itineraries to supplier payments and client billing.",
      "Originally from Germany, Daniel brings a finance background from outside the travel industry, which keeps the team's pricing discipline sharp.",
      "He works closely with the travel design team to keep pricing honest: what a client is quoted is what the finance team can actually stand behind once every cost is accounted for.",
    ],
    focusAreas: ["Pricing oversight", "Supplier payments", "Client billing"],
  },
  {
    slug: "oliver-bennett",
    name: "Oliver Bennett",
    title: "Marketing & Partnerships Manager",
    department: "Marketing & Partnerships",
    reportsToSlug: "earl-anderson",
    photo: stockPortrait("1651684215020-f7a5b6610f23"),
    bio: [
      "Oliver leads how World Bridge Meridian tells its own story — the journal, destination content, and the evaluation of new hospitality and travel partners before they're brought into any itinerary.",
      "Originally from the United Kingdom, Oliver came to travel marketing from a content and publishing background.",
      "He and his team vet every potential partner directly before a recommendation is ever made to a client.",
    ],
    focusAreas: ["Journal and content", "Partner evaluation", "Brand and marketing"],
  },

  // ---------------------------------------------------------------- Managers
  {
    slug: "sofia-marchetti",
    name: "Sofia Marchetti",
    title: "Travel Coordination Manager",
    department: "Travel Design & Experience",
    reportsToSlug: "claire-dunmore",
    photo: stockPortrait("1699899657680-421c2c2d5064"),
    bio: [
      "Sofia manages the regional coordinating officers who turn a confirmed itinerary into a working travel plan — bookings, timing, and the hundred small details that sit between a plan on paper and a plan that actually runs.",
      "Originally from Italy, Sofia coordinated itineraries across every region World Bridge Meridian operates in before stepping into management.",
      "She reviews every itinerary before it's finalized for a client, checking that pacing, connections and logistics genuinely hold together.",
    ],
    focusAreas: ["Coordinating officer team", "Itinerary quality review", "Cross-regional handoffs"],
  },
  {
    slug: "ethan-walsh",
    name: "Ethan Walsh",
    title: "Cruise & Group Travel Manager",
    department: "Travel Design & Experience",
    reportsToSlug: "claire-dunmore",
    photo: stockPortrait("1627161684458-a62da52b51c3"),
    bio: [
      "Ethan manages cruise itinerary building and group travel logistics — cabin categories, shared departures, and the coordination that group trips need beyond a standard individual journey.",
      "Originally from Ireland, Ethan spent several years on cruise-line booking desks before joining World Bridge Meridian.",
      "He works directly with cruise operators' booking desks to hold cabin allocations and manage group-rate logistics.",
    ],
    focusAreas: ["Cruise itinerary building", "Group departures", "Cabin and group-rate logistics"],
  },
  {
    slug: "erin-sinclair",
    name: "Erin Sinclair",
    title: "Air & Itinerary Planning Manager",
    department: "Operations",
    reportsToSlug: "lucas-ferreira",
    photo: stockPortrait("1580489944761-15a19d654956"),
    bio: [
      "Erin manages flight itinerary planning — routing, connection timing, and the kind of contingency planning that keeps a long multi-city journey from unraveling over one missed connection.",
      "Originally from New Zealand, Erin has a background in airline operations, which shows in how closely her team plans routing and connections.",
      "Her team is the first call if a flight schedule changes mid-journey and a route needs to be rebuilt on short notice.",
    ],
    focusAreas: ["Flight routing and connections", "Itinerary contingency planning", "Mid-trip schedule changes"],
  },
  {
    slug: "marcus-bello",
    name: "Marcus Bello",
    title: "Corporate Travel Manager",
    department: "Travel Design & Experience",
    reportsToSlug: "claire-dunmore",
    photo: stockPortrait("1642257859842-c95f9fa8121d"),
    bio: [
      "Marcus leads corporate and delegation travel — group logistics, approval workflows, and the reporting that institutional clients need alongside a well-run itinerary.",
      "Originally from Nigeria, Marcus previously managed corporate accounts for a hospitality group before moving into corporate travel.",
      "He's usually the first point of contact for a company or organization booking travel for a team rather than a single traveler.",
    ],
    focusAreas: ["Corporate and delegation travel", "Approval workflows", "Institutional reporting"],
  },
  {
    slug: "isabel-rojas",
    name: "Isabel Rojas",
    title: "Client Experience Manager",
    department: "Client Experience",
    reportsToSlug: "rachel-hendricks",
    photo: stockPortrait("1494790108377-be9c29b29330"),
    bio: [
      "Isabel manages the associates and guest relations officers who support clients before, during and after their journey — the team a client actually talks to day to day.",
      "Originally from Colombia, Isabel has led client-facing teams for most of her career, with a focus on response times and follow-through.",
      "She sets response-time standards for the team and reviews how every enquiry and in-trip request is handled.",
    ],
    focusAreas: ["Client experience associates", "Response-time standards", "Enquiry handling"],
  },

  // ---------------------------------------------------------------- Coordinating officers & specialists
  {
    slug: "camille-toussaint",
    name: "Camille Toussaint",
    title: "Travel Coordinating Officer — Europe",
    department: "Travel Design & Experience",
    reportsToSlug: "sofia-marchetti",
    photo: stockPortrait("1573497019940-1c28c88b4f3e"),
    bio: [
      "Camille coordinates travel packages and flight itineraries across World Bridge Meridian's European destinations — matching hotels, transport and local experiences to a confirmed itinerary and locking in the bookings behind it.",
      "Originally from Martinique, Camille has coordinated European itineraries since early in her career and knows the region's logistics in detail.",
      "She's the coordinating officer clients traveling through Europe are most likely to hear from directly while a trip is being built.",
    ],
    focusAreas: ["European itinerary coordination", "Hotel and transport bookings", "Client-facing itinerary confirmation"],
  },
  {
    slug: "ravi-chandran",
    name: "Ravi Chandran",
    title: "Travel Coordinating Officer — Asia-Pacific",
    department: "Travel Design & Experience",
    reportsToSlug: "sofia-marchetti",
    photo: stockPortrait("1629425733761-caae3b5f2e50"),
    bio: [
      "Ravi coordinates travel packages and flight itineraries across Asia-Pacific destinations, from city stopovers to multi-country journeys spanning several time zones.",
      "Originally from India, Ravi has coordinated Asia-Pacific itineraries across a wide range of multi-country routings.",
      "He handles the booking confirmations and day-by-day logistics once a client's Asia-Pacific itinerary has been designed and approved.",
    ],
    focusAreas: ["Asia-Pacific itinerary coordination", "Multi-country routing", "Booking confirmations"],
  },
  {
    slug: "natalia-vargas",
    name: "Natalia Vargas",
    title: "Travel Coordinating Officer — Americas",
    department: "Travel Design & Experience",
    reportsToSlug: "sofia-marchetti",
    photo: stockPortrait("1627161683077-e34782c24d81"),
    bio: [
      "Natalia coordinates travel packages and flight itineraries across North and South America, working closely with local ground partners to keep transfers and excursions running on schedule.",
      "Originally from Argentina, Natalia brings first-hand knowledge of South American logistics to the Americas desk.",
      "She manages the logistics for many of the company's multi-city North American itineraries.",
    ],
    focusAreas: ["Americas itinerary coordination", "Ground partner logistics", "Multi-city routing"],
  },
  {
    slug: "kwame-mensah",
    name: "Kwame Mensah",
    title: "Travel Coordinating Officer — Middle East & Africa",
    department: "Travel Design & Experience",
    reportsToSlug: "sofia-marchetti",
    photo: stockPortrait("1595211877493-41a4e5f236b3"),
    bio: [
      "Kwame coordinates travel packages and flight itineraries across the Middle East and Africa, including the bush-flight and lodge logistics that safari itineraries depend on.",
      "Originally from Ghana, Kwame has deep familiarity with East and Southern African safari logistics.",
      "He works directly with regional ground handlers to keep safari and desert-extension logistics tightly scheduled.",
    ],
    focusAreas: ["MEA itinerary coordination", "Safari and lodge logistics", "Bush-flight scheduling"],
  },
  {
    slug: "grace-lindqvist",
    name: "Grace Lindqvist",
    title: "Flight & Itinerary Coordinator",
    department: "Operations",
    reportsToSlug: "erin-sinclair",
    photo: stockPortrait("1701096374092-bb70915fdc5c"),
    bio: [
      "Grace builds and confirms flight itineraries for individual and family journeys, checking connection times, layover length and routing against each traveler's actual plans.",
      "Originally from Sweden, Grace has a background in airline scheduling before moving into client-facing itinerary planning.",
      "She flags anything that looks tight or risky before it ever reaches a client's confirmed itinerary.",
    ],
    focusAreas: ["Flight itinerary building", "Connection-time review", "Family journey routing"],
  },
  {
    slug: "tomas-novak",
    name: "Tomas Novak",
    title: "Flight & Itinerary Coordinator",
    department: "Operations",
    reportsToSlug: "erin-sinclair",
    photo: stockPortrait("1500648767791-00dcc994a43e"),
    bio: [
      "Tomas builds and confirms flight itineraries with a focus on multi-city and round-the-world routings, where a single change can affect every leg that follows.",
      "Originally from the Czech Republic, Tomas specializes in the kind of complex, multi-leg routings that most itineraries never need.",
      "He's usually the one rebuilding a routing from scratch when a client's plans shift midway through booking.",
    ],
    focusAreas: ["Multi-city flight routing", "Itinerary rebuilding", "Fare and routing options"],
  },
  {
    slug: "jasmine-carter",
    name: "Jasmine Carter",
    title: "Cruise Booking Coordinator",
    department: "Travel Design & Experience",
    reportsToSlug: "ethan-walsh",
    photo: stockPortrait("1573496358961-3c82861ab8f4"),
    bio: [
      "Jasmine manages cabin bookings, deck and category selection, and the shore-excursion planning that rounds out a cruise itinerary.",
      "Originally from the Bahamas, Jasmine brings a lifelong familiarity with island and cruise travel to her work.",
      "She works directly with clients to match cabin category and location on the ship to how they actually plan to spend their days at sea.",
    ],
    focusAreas: ["Cabin bookings", "Shore excursion planning", "Cruise category selection"],
  },
  {
    slug: "youssef-amrani",
    name: "Youssef Amrani",
    title: "Group Travel Coordinator",
    department: "Travel Design & Experience",
    reportsToSlug: "ethan-walsh",
    photo: stockPortrait("1507003211169-0a1dd7228f2d"),
    bio: [
      "Youssef coordinates group departures — matching individual travelers' preferences within a shared itinerary, and managing the logistics that scale differently once a trip involves ten or more people.",
      "Originally from Morocco, Youssef has coordinated group travel across a wide range of group sizes and itineraries.",
      "He handles rooming lists, group transport and the communication that keeps a group itinerary running smoothly for everyone in it.",
    ],
    focusAreas: ["Group departure logistics", "Rooming lists", "Group transport coordination"],
  },
  {
    slug: "megan-oconnell",
    name: "Megan O'Connell",
    title: "Client Experience Associate",
    department: "Client Experience",
    reportsToSlug: "isabel-rojas",
    photo: stockPortrait("1580894732444-8ecded7900cd"),
    bio: [
      "Megan is a first point of contact for client enquiries — questions about an itinerary, a change request, or simply what to expect before departure.",
      "Originally from Ireland, Megan joined World Bridge Meridian early in her career and has been a client's first point of contact ever since.",
      "She routes anything that needs specialist attention to the right coordinating officer or manager, and follows up to make sure it actually gets resolved.",
    ],
    focusAreas: ["Client enquiries", "Pre-departure questions", "Internal follow-up"],
  },
  {
    slug: "diego-castillo",
    name: "Diego Castillo",
    title: "Guest Relations Officer",
    department: "Client Experience",
    reportsToSlug: "isabel-rojas",
    photo: stockPortrait("1556157382-97eda2d62296"),
    bio: [
      "Diego supports clients while they're actually traveling — the contact point if a flight is delayed, a hotel booking needs adjusting, or a plan needs to change mid-trip.",
      "Originally from Mexico, Diego has worked in guest services for most of his career, including several years with an international hotel group.",
      "He works outside standard office hours when a journey is in progress, since travel problems rarely happen on a convenient schedule.",
    ],
    focusAreas: ["In-trip support", "Mid-journey changes", "Emergency contact handling"],
  },
  {
    slug: "simone-baptiste",
    name: "Simone Baptiste",
    title: "Visa & Travel Documentation Officer",
    department: "Operations",
    reportsToSlug: "lucas-ferreira",
    photo: stockPortrait("1611432579699-484f7990b127"),
    bio: [
      "Simone tracks visa requirements, passport validity rules and entry documentation for every destination on a client's itinerary, and flags what each traveler needs to arrange before departure.",
      "Originally from Trinidad and Tobago, Simone has a background in international documentation and visa processing.",
      "She keeps the documentation requirements behind every destination page current as entry rules change.",
    ],
    focusAreas: ["Visa requirement tracking", "Entry documentation", "Passport validity checks"],
  },
  {
    slug: "nathan-reed",
    name: "Nathan Reed",
    title: "Finance & Billing Officer",
    department: "Finance",
    reportsToSlug: "daniel-hoffmann",
    photo: stockPortrait("1560250097-0b93528c311a"),
    bio: [
      "Nathan manages client billing, payment schedules and supplier invoices, making sure every itinerary's finances stay accurate from initial quote through to final payment.",
      "Originally from the United States, Nathan has a finance and accounting background from outside the travel industry.",
      "He's the point of contact for any billing question once a journey is confirmed.",
    ],
    focusAreas: ["Client billing", "Payment schedules", "Supplier invoicing"],
  },
  {
    slug: "chloe-campbell",
    name: "Chloe Campbell",
    title: "Marketing Coordinator",
    department: "Marketing & Partnerships",
    reportsToSlug: "oliver-bennett",
    photo: stockPortrait("1573497161161-c3e73707e25c"),
    bio: [
      "Chloe coordinates World Bridge Meridian's journal content and destination updates, working with the travel design team to keep destination information accurate and genuinely useful.",
      "Originally from Canada, Chloe has a background in travel journalism before moving into content coordination.",
      "She manages the editorial calendar behind the journal's destination guides and travel planning articles.",
    ],
    focusAreas: ["Journal editorial calendar", "Destination content updates", "Content accuracy review"],
  },
  {
    slug: "connor-blake",
    name: "Connor Blake",
    title: "Partnerships & Supplier Relations Coordinator",
    department: "Operations",
    reportsToSlug: "lucas-ferreira",
    photo: stockPortrait("1568602471122-7832951cc4c5"),
    bio: [
      "Connor coordinates day-to-day communication with hotel, ground transport and activity partners, and helps evaluate new suppliers before they're added to any itinerary.",
      "Originally from Scotland, Connor has managed supplier relationships across hospitality and ground transport for most of his career.",
      "He tracks supplier performance so recommendations stay based on what actually works well for clients, not just what's contracted.",
    ],
    focusAreas: ["Supplier communication", "New partner evaluation", "Supplier performance tracking"],
  },
];

export function getTeamMember(slug: string) {
  return team.find((t) => t.slug === slug);
}

export function directReports(slug: string) {
  return team.filter((t) => t.reportsToSlug === slug);
}
