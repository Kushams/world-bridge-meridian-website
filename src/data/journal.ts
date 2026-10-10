import { JournalArticle } from "./types";
import { themeImage, unsplashPhoto } from "./images";

export const journalCategories = [
  "Destinations",
  "Travel Inspiration",
  "Luxury Travel",
  "Arts & Culture",
  "Cruises",
  "Family Travel",
  "Couples Travel",
  "Group Travel",
  "Travel Tips",
  "Seasonal Journeys",
] as const;

export const journal: JournalArticle[] = [
  {
    slug: "what-does-a-bespoke-travel-planner-do",
    title: "What Does a Bespoke Travel Planner Do — and Is It Worth It?",
    category: "Travel Inspiration",
    date: "2026-10-08",
    author: "World Bridge Meridian Editorial",
    readingTime: "6 min read",
    heroImage: unsplashPhoto("1692895591954-451050db22fd"),
    excerpt:
      "A bespoke travel planner designs a journey around you rather than selling you a package. Here's what that work involves, and when it's worth paying for.",
    body: [
      "A bespoke travel planner designs a trip from a blank page around one traveler, couple, family or group. Instead of choosing from a fixed package, you describe how you like to travel, and the planner builds the route, pace, accommodation and experiences to match, then coordinates everything until you're home.",
      "In practice, the work starts with a conversation, not a booking form. We ask what a good day on holiday looks like to you, who is travelling, what you've loved or disliked on past trips, and what absolutely has to happen. That conversation shapes everything that follows.",
      "From there, a planner sequences the journey: which cities or regions, in what order, for how many nights, and how you move between them. Getting that sequence right is most of the difference between a trip that flows and one that feels like a series of transfers.",
      "The planner then matches accommodation to the way you travel. That might mean connecting rooms for a family, a villa for a group, or a smaller property with a better location for a couple. They also arrange private guides, cultural access, dining and transport that would be difficult to secure, or even discover, on your own.",
      "Finally, a planner is your point of contact while you travel. If a flight is cancelled or plans change, there is one person who knows the whole itinerary and can rearrange the pieces around it.",
      "It's most worth it for multi-city or multi-country trips, milestone journeys such as honeymoons and anniversaries, family trips spanning several generations, group travel, and destinations where local knowledge and access really matter. For a simple weekend in a city you already know, booking directly is usually enough.",
    ],
    faqs: [
      {
        question: "What is a bespoke travel planner?",
        answer:
          "A bespoke travel planner designs a custom journey around a specific traveler or group, covering the route, pace, accommodation, guides and experiences, and coordinates the trip from planning through to your return.",
      },
      {
        question: "How is bespoke travel different from a package holiday?",
        answer:
          "A package holiday is a fixed itinerary sold to many travelers. A bespoke journey is built from scratch for one client, so the destinations, timing, hotels and activities all reflect that client's preferences.",
      },
      {
        question: "When is a travel planner worth it?",
        answer:
          "A planner adds the most value on multi-destination trips, honeymoons and milestone celebrations, multi-generational family travel, group trips, and destinations where private access and local expertise make a real difference.",
      },
    ],
    relatedDestinationSlugs: ["paris", "kyoto", "cape-town", "maldives"],
  },
  {
    slug: "how-to-plan-a-private-cultural-trip-to-japan",
    title: "How to Plan a Private Cultural Trip to Japan",
    category: "Destinations",
    date: "2026-10-06",
    author: "World Bridge Meridian Editorial",
    readingTime: "7 min read",
    heroImage: unsplashPhoto("1686560663630-890ee2005c47"),
    excerpt:
      "Temples, tea, craft and food: how to shape a first or return trip to Japan around culture rather than checklists.",
    body: [
      "Plan a cultural trip to Japan around a small number of bases, usually Tokyo and Kyoto, with time to slow down in each. Then build each day around one or two meaningful experiences rather than a long list of sights. Ten to fourteen days suits most first visits.",
      "Tokyo is the natural starting point: museums, design, contemporary art and the energy of the city. Three or four nights gives time for both the famous districts and the quieter neighborhoods where the city feels most like itself.",
      "Kyoto is where most travelers feel Japan's traditional culture most closely: temples and gardens, tea ceremony, craft workshops and kaiseki dining. We recommend at least four nights, so that early-morning visits to the best-known temples, before the crowds arrive, are possible rather than rushed.",
      "A private guide changes a cultural trip to Japan more than almost anywhere else. Context, etiquette and language open doors, and a good guide can arrange experiences such as time with a craftsperson or a tea master that aren't sold as standard tours.",
      "Timing matters. Spring cherry blossom and autumn foliage are spectacular but are also the busiest and most expensive periods, and the best ryokan and hotels book many months ahead. Late autumn and the weeks either side of peak blossom often balance beauty and crowds well.",
      "A night or two in a traditional ryokan, ideally with hot-spring baths, is one of the most memorable parts of a trip to Japan. It works best as a pause between cities rather than as an overnight stop squeezed into a busy schedule.",
    ],
    faqs: [
      {
        question: "How many days do you need for a cultural trip to Japan?",
        answer:
          "Ten to fourteen days suits most first visits, with three to four nights in Tokyo, at least four in Kyoto, and a night or two in a traditional ryokan.",
      },
      {
        question: "Is a private guide worth it in Japan?",
        answer:
          "Yes for culture-focused trips. A private guide provides context, handles language and etiquette, and can arrange experiences with craftspeople, tea masters and temples that aren't available as standard tours.",
      },
      {
        question: "When is the best time to visit Japan for culture?",
        answer:
          "Spring and autumn are the most beautiful seasons but also the busiest. The weeks either side of peak cherry blossom, and late autumn, often balance scenery and crowds well. Book the best hotels and ryokan many months ahead.",
      },
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto"],
  },
  {
    slug: "what-shapes-the-cost-of-a-luxury-safari",
    title: "What Shapes the Cost of a Luxury Safari",
    category: "Luxury Travel",
    date: "2026-10-04",
    author: "World Bridge Meridian Editorial",
    readingTime: "6 min read",
    heroImage: themeImage("safari", 1),
    excerpt:
      "Two safaris of the same length can differ enormously in price. These are the factors that actually move the number.",
    body: [
      "The cost of a luxury safari depends mainly on five things: the season, the lodge, how private the reserve is, how you travel between camps, and how long you stay. Understanding those factors helps you decide where to spend and where to save.",
      "Season is the biggest single factor. Peak months, when wildlife viewing is at its best and international school holidays fall, command the highest rates and sell out early. Shoulder months can offer excellent game viewing at noticeably lower rates.",
      "Lodges vary widely. The most exclusive camps keep guest numbers small, include most meals and activities in the rate, and are staffed generously. That inclusiveness is part of the price, so compare what is included rather than the nightly rate alone.",
      "Location within a region matters too. Private reserves and conservancies limit the number of vehicles at a sighting and often allow off-road driving, night drives and walking safaris that national parks restrict. That privacy usually costs more, and for many travelers it's where the value lies.",
      "Moving between camps by light aircraft saves long road transfers and adds to the experience, but it adds cost and comes with strict luggage limits, usually soft bags only. Fewer, longer stays reduce both transfer costs and travel fatigue.",
      "Finally, many travelers combine a safari with a city or beach stay, for example Nairobi with Zanzibar, or Cape Town with a reserve. Splitting the trip this way can balance the budget, and it's a gentler end to an early-starting week.",
    ],
    faqs: [
      {
        question: "What affects the price of a luxury safari?",
        answer:
          "Season, the lodge and what its rate includes, whether you stay in a private reserve or a national park, transfers between camps by road or light aircraft, and the number of nights.",
      },
      {
        question: "Is a private reserve worth the extra cost?",
        answer:
          "For many travelers, yes. Private reserves limit vehicles at sightings and often allow off-road driving, night drives and walking safaris that national parks restrict.",
      },
      {
        question: "Can you combine a safari with a beach holiday?",
        answer:
          "Yes. Popular combinations include a Kenyan safari followed by Zanzibar, or a South African reserve paired with Cape Town and the Winelands.",
      },
    ],
    relatedDestinationSlugs: ["nairobi", "zanzibar", "cape-town"],
  },
  {
    slug: "maldives-or-seychelles-choosing-an-island-honeymoon",
    title: "Maldives or Seychelles? Choosing an Island Honeymoon",
    category: "Couples Travel",
    date: "2026-10-02",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: themeImage("tropicalBeach", 1),
    excerpt:
      "Both are Indian Ocean icons, but they suit very different honeymoons. Here's how to choose between them, and where Mauritius fits.",
    body: [
      "Choose the Maldives if your ideal honeymoon is total seclusion: an overwater villa, a private island resort and days spent between the lagoon and the reef. Choose the Seychelles if you want dramatic granite beaches, lush hiking and the freedom to explore more than one island.",
      "The Maldives is built around the one-island, one-resort model. You arrive by seaplane or speedboat and stay put, which makes it effortless and very private. The snorkeling and diving straight from the villa are exceptional, and the resort you choose largely defines the trip.",
      "The Seychelles feels wilder and more varied. Granite boulders, forested hills and beaches that are often among the most photographed in the world make island-hopping between Mahé, Praslin and La Digue part of the appeal. It suits couples who want to move around and explore.",
      "Mauritius is a strong alternative for couples who want a beach honeymoon with more to do on land: varied cuisine, hiking, golf and culture alongside excellent resorts, often with easier flight connections.",
      "Whichever you choose, the best villas and resorts book many months ahead for popular honeymoon dates, so begin planning as soon as your wedding date is set.",
    ],
    faqs: [
      {
        question: "Is the Maldives or the Seychelles better for a honeymoon?",
        answer:
          "The Maldives is better for complete seclusion, overwater villas and reef snorkeling at a single resort. The Seychelles is better for couples who want dramatic beaches, hiking and island-hopping.",
      },
      {
        question: "Can you visit more than one island in the Seychelles?",
        answer:
          "Yes. Island-hopping between Mahé, Praslin and La Digue by short flight or ferry is one of the main reasons couples choose the Seychelles.",
      },
      {
        question: "How far in advance should you book an island honeymoon?",
        answer:
          "Start as soon as your wedding date is set. The most sought-after villas and resorts book many months ahead for popular honeymoon periods.",
      },
    ],
    relatedDestinationSlugs: ["maldives", "seychelles", "mauritius"],
  },
  {
    slug: "can-you-pay-for-travel-with-cryptocurrency",
    title: "Can You Pay for Travel With Cryptocurrency? How It Works With Us",
    category: "Travel Tips",
    date: "2026-09-30",
    author: "World Bridge Meridian Editorial",
    readingTime: "4 min read",
    heroImage: unsplashPhoto("1692895591954-451050db22fd"),
    excerpt:
      "Yes. World Bridge Meridian has accepted cryptocurrency since 2015. Here's exactly how a crypto payment for a journey works, and how to stay safe.",
    body: [
      "Yes, you can pay for travel with cryptocurrency through World Bridge Meridian. We have accepted crypto since 2015, including Bitcoin, Ethereum and USDT stablecoins on several networks, alongside card, bank transfer and regional payment partners.",
      "There is no online checkout. Every journey is designed, priced and confirmed with you directly first. Your consultant then sends payment instructions: the exact amount, the asset, the network and the address for your booking.",
      "After sending the payment, you record the transaction reference (the hash) on our payments page. Submitting a hash does not confirm the payment by itself: our team verifies every transaction manually on the blockchain before marking it confirmed.",
      "Two safety rules matter most. First, always send on the exact network your consultant specifies, because sending a token on the wrong network can lose the funds. Second, only act on payment instructions that are part of a confirmed conversation about your own journey. If anything about a payment request looks unusual, contact us before sending.",
      "Stablecoins such as USDT are often the most practical choice for travel, because their value is pegged to the US dollar and won't move between confirmation and payment.",
    ],
    faqs: [
      {
        question: "Does World Bridge Meridian accept cryptocurrency?",
        answer:
          "Yes. World Bridge Meridian has accepted cryptocurrency since 2015, including Bitcoin, Ethereum and USDT stablecoins on several networks, as well as card and bank transfer.",
      },
      {
        question: "How do I pay for a trip with crypto?",
        answer:
          "Your journey is priced and confirmed with your consultant first. They send the exact amount, asset, network and address. After paying, you record the transaction hash on the payments page, and the team verifies it manually on the blockchain.",
      },
      {
        question: "Which cryptocurrency is best for paying for travel?",
        answer:
          "Stablecoins such as USDT are often the most practical, because they are pegged to the US dollar and their value doesn't change between confirmation and payment.",
      },
    ],
  },
  {
    slug: "planning-a-multi-generational-family-trip",
    title: "How to Plan a Multi-Generational Family Trip That Actually Works",
    category: "Family Travel",
    date: "2026-02-10",
    author: "World Bridge Meridian Editorial",
    readingTime: "6 min read",
    heroImage: themeImage("peopleTravel", 2),
    excerpt:
      "Three generations, three sets of expectations. Here's how we structure a family journey so nobody spends the trip compromising.",
    body: [
      "The hardest part of a multi-generational trip usually isn't the destination — it's the pace. Grandparents often want fewer, longer stops. Young children need built-in downtime. Teenagers want at least one day that feels like theirs.",
      "We start by asking every generation separately what they actually want from the trip, rather than assuming the group will agree once they arrive. That usually surfaces at least one non-negotiable per generation early enough to plan around it.",
      "From there, the itinerary gets built around a shared home base — one hotel or villa for several nights — with optional excursions each day rather than a single group itinerary everyone has to follow. Nobody has to opt out loudly; they simply choose their own day.",
      "The last piece is accommodation that actually works for a group: connecting rooms or a villa with separate wings, rather than several rooms scattered across a large hotel.",
    ],
    relatedDestinationSlugs: ["rome", "florence", "venice"],
  },
  {
    slug: "best-time-to-visit-santorini",
    title: "The Best Time to Visit Santorini (and When to Avoid It)",
    category: "Destinations",
    date: "2026-01-22",
    author: "World Bridge Meridian Editorial",
    readingTime: "4 min read",
    heroImage: themeImage("coastal", 0),
    excerpt: "Santorini in July is a different island than Santorini in May. Here's how the seasons actually compare.",
    body: [
      "Santorini's shoulder seasons — May to mid-June and September into October — offer the caldera views and sunset dinners the island is known for, without July and August's crowds and peak pricing.",
      "July and August bring reliably warm water and long daylight hours, but Oia's clifftop paths can be genuinely crowded by late afternoon, and restaurant reservations need to be made weeks in advance.",
      "Winter (November through March) sees many hotels and restaurants close entirely, so it's not a season we generally recommend for a first visit, though a small number of properties do stay open for clients specifically seeking a quiet, low-cost off-season stay.",
    ],
    relatedDestinationSlugs: ["santorini", "athens"],
  },
  {
    slug: "what-a-bespoke-journey-actually-means",
    title: "What 'Bespoke Journey' Actually Means (and What It Doesn't)",
    category: "Travel Inspiration",
    date: "2025-12-15",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: unsplashPhoto("1748016276313-7f9b25de7376"),
    excerpt: "The word gets used loosely across the travel industry. Here's what it means when we use it.",
    body: [
      "A bespoke journey, to us, means the itinerary is built from your specific interests and constraints outward — not selected from a fixed catalog of packages and lightly adjusted.",
      "In practice, that means we start with a conversation rather than a brochure: where you're drawn to, who you're traveling with, what pace works, and what you specifically want more or less of.",
      "It doesn't mean unlimited budget or entirely improvised logistics. A well-built bespoke journey still has structure — reliable transportation, sensible pacing, and accommodation that's been personally vetted — it's just built around you rather than around a template.",
    ],
  },
  {
    slug: "guide-to-mediterranean-cruising",
    title: "A First-Timer's Guide to Mediterranean Cruising",
    category: "Cruises",
    date: "2025-11-30",
    author: "World Bridge Meridian Editorial",
    readingTime: "7 min read",
    heroImage: themeImage("cruiseAndSea", 0),
    excerpt: "Cabin categories, port choices and how much time you actually get in each city.",
    body: [
      "A seven-night Mediterranean cruise typically calls at four to six ports, with roughly six to eight hours ashore at each — enough for a well-planned highlight, not enough to see a city thoroughly.",
      "For clients who want more depth in a specific city, we usually recommend adding a two- or three-night land stay before or after the cruise, rather than trying to see everything from the ship.",
      "Cabin category matters more for longer sailings than shorter ones — a balcony is worth the upgrade on anything over a week, less essential on a five-night hop between a handful of nearby ports.",
    ],
    relatedDestinationSlugs: ["barcelona", "rome", "venice"],
  },
  {
    slug: "arts-culture-travel-museums-worth-building-a-trip-around",
    title: "Five Museums Worth Building an Entire Trip Around",
    category: "Arts & Culture",
    date: "2025-11-05",
    author: "World Bridge Meridian Editorial",
    readingTime: "6 min read",
    heroImage: unsplashPhoto("1761563071832-e548e022a706"),
    excerpt: "Some collections are large enough, and specific enough, to justify a dedicated journey.",
    body: [
      "The Uffizi in Florence rewards more than a single pass — a private early-access morning followed by a return visit later in the trip lets the collection breathe rather than blur together.",
      "The Egyptian Museum in Cairo, paired with the pyramids themselves, turns a history-textbook subject into something you can walk through.",
      "Vienna's Kunsthistorisches Museum, the Rijksmuseum in Amsterdam, and Tokyo's smaller specialist museums round out a list of collections we regularly build entire multi-day stays around.",
    ],
    relatedDestinationSlugs: ["florence", "cairo", "vienna", "amsterdam", "tokyo"],
  },
  {
    slug: "safari-packing-what-actually-matters",
    title: "Safari Packing: What Actually Matters",
    category: "Travel Tips",
    date: "2025-10-18",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: themeImage("safari", 0),
    excerpt: "Fewer items, better chosen. Here's what we tell every client before a Kenya or Tanzania departure.",
    body: [
      "Most bush-flight operators enforce a soft-sided bag limit of around 15kg (33lb) per person, which changes how you pack more than any climate consideration does.",
      "Neutral colors matter more for insects than for camouflage — earth tones genuinely attract fewer tsetse flies than bright colors or white.",
      "A good pair of binoculars, a lightweight rain layer regardless of season, and a battery pack for charging in camp are the three items clients most often wish they'd brought.",
    ],
    relatedDestinationSlugs: ["nairobi"],
  },
  {
    slug: "honeymoon-planning-timeline",
    title: "How Far in Advance to Plan a Honeymoon",
    category: "Couples Travel",
    date: "2025-09-27",
    author: "World Bridge Meridian Editorial",
    readingTime: "4 min read",
    heroImage: themeImage("peopleTravel", 0),
    excerpt: "The realistic planning window for popular destinations and peak seasons.",
    body: [
      "For destinations like the Maldives and Santorini during peak season, we recommend starting the conversation six to nine months ahead — the best overwater villas and caldera suites book early.",
      "Shoulder-season travel or less in-demand destinations can be arranged with considerably less lead time, sometimes as little as six to eight weeks.",
      "The biggest factor isn't the destination itself but whether the couple wants a specific room category or experience — private sandbank picnics, particular suite categories — which tend to have the most limited availability.",
    ],
    relatedDestinationSlugs: ["maldives", "santorini", "seychelles"],
  },
  {
    slug: "corporate-retreats-that-dont-feel-like-work",
    title: "Corporate Retreats That Don't Feel Like an Extended Meeting",
    category: "Group Travel",
    date: "2025-09-02",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: unsplashPhoto("1758797316165-986ec92e7ad2"),
    excerpt: "The structural choices that separate a good offsite from a tedious one.",
    body: [
      "The retreats that work best block meeting time into focused morning sessions, leaving afternoons genuinely free rather than filling them with mandatory group activities.",
      "A single well-chosen group excursion — a wine tasting, a sailing afternoon — does more for team cohesion than a packed schedule of forced team-building exercises.",
      "Venue choice matters: a property with both proper meeting space and enough separation between work and leisure areas keeps the retreat from feeling like the office relocated.",
    ],
    relatedDestinationSlugs: ["lisbon", "barcelona"],
  },
  {
    slug: "shoulder-season-europe-guide",
    title: "Why Shoulder Season Is the Best-Kept Secret in European Travel",
    category: "Seasonal Journeys",
    date: "2025-08-14",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: themeImage("cityscape", 1),
    excerpt: "April–June and September–October, explained.",
    body: [
      "Shoulder-season travel to Europe's major cities means shorter museum lines, more restaurant availability, and hotel rates that are often 20–30% below peak summer pricing.",
      "Weather is the trade-off worth understanding: late spring can still bring rain in northern Europe, and early autumn evenings cool faster than midsummer ones — worth packing a layer regardless of forecast.",
      "For clients with flexible dates, we generally steer first-time Europe trips toward late April through early June, when daylight hours are long but the peak-summer crowds haven't arrived yet.",
    ],
    relatedDestinationSlugs: ["paris", "rome", "barcelona", "vienna"],
  },
  {
    slug: "japan-cherry-blossom-planning",
    title: "Planning Around Japan's Cherry Blossom Season",
    category: "Seasonal Journeys",
    date: "2025-07-30",
    author: "World Bridge Meridian Editorial",
    readingTime: "4 min read",
    heroImage: unsplashPhoto("1598957232485-fab51e0ed7e8"),
    excerpt: "Bloom dates shift every year — here's how we plan around the uncertainty.",
    body: [
      "Cherry blossom bloom dates in Tokyo typically fall in late March to early April, but the exact window shifts year to year and can only be forecast reliably a few weeks in advance.",
      "Because of that uncertainty, we build in flexibility — a Tokyo-to-Kyoto itinerary with a few unstructured days rather than a single date-specific park visit — so the trip isn't dependent on hitting peak bloom exactly.",
      "Kyoto's bloom typically follows Tokyo's by about a week, which means a well-timed itinerary can catch blossoms in both cities across a single trip.",
    ],
    relatedDestinationSlugs: ["tokyo", "kyoto"],
  },
  {
    slug: "why-we-dont-sell-airline-tickets-alone",
    title: "Why We Don't Just Sell Airline Tickets",
    category: "Travel Inspiration",
    date: "2025-06-19",
    author: "World Bridge Meridian Editorial",
    readingTime: "3 min read",
    heroImage: unsplashPhoto("1543797414-a0c3ad076f7c"),
    excerpt: "A short note on how we think about our role in a client's journey.",
    body: [
      "We're often asked why we don't operate more like a conventional booking site — search a flight, search a hotel, check out. The honest answer is that the parts of a trip clients remember rarely come from a single transaction.",
      "Our role is closer to coordination: matching accommodation to how a family actually travels, sequencing a multi-city itinerary so the pace makes sense, and being the point of contact when something needs to change.",
      "Airlines, hotels and cruise lines remain essential partners in that process — we're not trying to replace them. We're organizing what happens around them.",
    ],
  },
  {
    slug: "cape-town-winelands-itinerary-tips",
    title: "Cape Town and the Winelands: How Much Time You Actually Need",
    category: "Destinations",
    date: "2025-05-12",
    author: "World Bridge Meridian Editorial",
    readingTime: "5 min read",
    heroImage: unsplashPhoto("1721155227599-bfb5e8913fc4"),
    excerpt: "A realistic breakdown of how to split time between the city, the Winelands and a safari extension.",
    body: [
      "Three nights in Cape Town is enough for Table Mountain, the Waterfront and Cape Point, without feeling rushed. Two nights is workable but tight if weather affects the cable car.",
      "The Winelands deserve at least two nights on their own rather than a single day trip — Stellenbosch and Franschhoek each reward an unhurried pace, and a day trip from the city means a lot of driving for not much tasting time.",
      "For clients adding a safari extension, we recommend budgeting flight time carefully: most Eastern Cape reserves are a short flight from Cape Town, but connections aren't always same-day depending on the lodge.",
    ],
    relatedDestinationSlugs: ["cape-town"],
  },
];

export function getArticle(slug: string) {
  return journal.find((a) => a.slug === slug);
}
