import { Experience } from "./types";
import { themeImage } from "./images";

export const experiences: Experience[] = [
  {
    slug: "rome-opera-evening",
    title: "An Evening at the Rome Opera",
    category: "Opera",
    destinationSlug: "rome",
    heroImage: themeImage("culturalHeritage", 5),
    shortDescription: "Private box seating at Teatro dell'Opera, arranged around the season's program.",
    description: [
      "We arrange preferred seating and, where available, a private box for a performance at Rome's opera house, paired with a pre-theatre dinner nearby.",
      "This experience is built into arts-and-culture journeys or added as a single evening to any Rome stay.",
    ],
    travelStyles: ["arts-culture", "luxury", "romance"],
  },
  {
    slug: "florence-uffizi-private-access",
    title: "Private Early Access: The Uffizi Gallery",
    category: "Museums",
    destinationSlug: "florence",
    heroImage: themeImage("culturalHeritage", 6),
    shortDescription: "A private-guided morning through the Uffizi before public opening hours.",
    description: [
      "We arrange early access to the Uffizi with a private art historian guide, ahead of the museum's public opening — the galleries at their quietest.",
    ],
    travelStyles: ["arts-culture", "luxury"],
  },
  {
    slug: "kyoto-tea-ceremony",
    title: "Private Tea Ceremony in Kyoto",
    category: "Culture",
    destinationSlug: "kyoto",
    heroImage: themeImage("culturalHeritage", 4),
    shortDescription: "A traditional tea ceremony hosted in a private setting with an English-speaking host.",
    description: [
      "A quiet, unhurried introduction to the Japanese tea ceremony, hosted in a traditional setting away from Kyoto's more visited temples.",
    ],
    travelStyles: ["arts-culture", "cultural", "romance"],
  },
  {
    slug: "tuscany-cooking-class",
    title: "Private Cooking Class in the Tuscan Countryside",
    category: "Food & Wine",
    destinationSlug: "florence",
    heroImage: themeImage("foodAndWine", 0),
    shortDescription: "A hands-on pasta and regional cooking class at a countryside farmhouse.",
    description: [
      "A morning market visit followed by a private cooking class at a Tuscan farmhouse, ending with the meal you've prepared over a long lunch.",
    ],
    travelStyles: ["food-wine", "romance", "family"],
  },
  {
    slug: "champagne-cellar-tasting",
    title: "Champagne House Cellar Tasting",
    category: "Food & Wine",
    destinationSlug: "paris",
    heroImage: themeImage("foodAndWine", 2),
    shortDescription: "A private cellar tour and tasting at a Champagne house, with transportation from Paris.",
    description: [
      "A day trip from Paris into Champagne, including a private cellar tour and tasting arranged around the house's availability.",
    ],
    travelStyles: ["food-wine", "luxury", "romance"],
  },
  {
    slug: "masai-mara-walking-safari",
    title: "Guided Walking Safari, Masai Mara",
    category: "Adventure",
    destinationSlug: "nairobi",
    heroImage: themeImage("safari", 1),
    shortDescription: "A guided walking safari led by a professional local guide, alongside standard game drives.",
    description: [
      "For clients wanting more than a vehicle-based safari, we arrange a guided walking excursion with an experienced local guide — a different, closer perspective on the bush.",
    ],
    travelStyles: ["adventure", "luxury"],
  },
  {
    slug: "sahara-overnight-camp",
    title: "Overnight Sahara Desert Camp",
    category: "Adventure",
    destinationSlug: "marrakech",
    heroImage: themeImage("desertArchitecture", 0),
    shortDescription: "A camel trek to a private desert camp, with dinner under the stars.",
    description: [
      "An overnight stay in a private Sahara camp, reached by camel at sunset, with a traditional dinner and stargazing before returning the following morning.",
    ],
    travelStyles: ["adventure", "romance"],
  },
  {
    slug: "santorini-catamaran-sunset",
    title: "Private Catamaran Sunset Sail",
    category: "Romantic Experiences",
    destinationSlug: "santorini",
    heroImage: themeImage("coastal", 0),
    shortDescription: "A private catamaran along the caldera, timed for sunset.",
    description: [
      "A private sailing excursion around Santorini's caldera, with swimming stops and a sunset dinner served onboard.",
    ],
    travelStyles: ["romance", "luxury"],
  },
  {
    slug: "bali-spa-wellness-day",
    title: "Full-Day Wellness & Spa Retreat",
    category: "Wellness",
    destinationSlug: "bali",
    heroImage: themeImage("wellness", 0),
    shortDescription: "A full day combining a private yoga session, spa treatments and a healthy tasting menu.",
    description: [
      "A dedicated wellness day at a retreat property in Ubud — private yoga, a choice of spa treatments, and a light tasting menu built around local ingredients.",
    ],
    travelStyles: ["wellness", "relaxation"],
  },
  {
    slug: "maldives-sandbank-picnic",
    title: "Private Sandbank Picnic",
    category: "Romantic Experiences",
    destinationSlug: "maldives",
    heroImage: themeImage("tropicalBeach", 1),
    shortDescription: "A private lunch set up on an uninhabited sandbank, reached by boat.",
    description: [
      "A private boat transfer to an uninhabited sandbank, with a set lunch, shade and snorkeling gear for the afternoon.",
    ],
    travelStyles: ["romance", "luxury"],
  },
  {
    slug: "sydney-opera-house-tour",
    title: "Sydney Opera House Backstage Tour",
    category: "Opera",
    destinationSlug: "sydney",
    heroImage: themeImage("culturalHeritage", 2),
    shortDescription: "A guided backstage tour paired with evening performance tickets where available.",
    description: [
      "A behind-the-scenes look at one of the world's most recognizable performance venues, paired with tickets to that evening's program when available.",
    ],
    travelStyles: ["arts-culture"],
  },
  {
    slug: "istanbul-bosphorus-private-boat",
    title: "Private Bosphorus Boat Crossing",
    category: "Culture",
    destinationSlug: "istanbul",
    heroImage: themeImage("culturalHeritage", 8),
    shortDescription: "A private boat crossing between Istanbul's European and Asian shores.",
    description: [
      "A private boat, rather than the public ferry, crossing the Bosphorus with stops for photographs and a waterside lunch.",
    ],
    travelStyles: ["cultural", "luxury"],
  },
  {
    slug: "hong-kong-dim-sum-tour",
    title: "Guided Dim Sum & Market Tour",
    category: "Food & Wine",
    destinationSlug: "hong-kong",
    heroImage: themeImage("foodAndWine", 3),
    shortDescription: "A morning of dim sum houses and wet markets with a local food guide.",
    description: [
      "A guided morning moving between traditional dim sum houses and Hong Kong's wet markets, led by a local food specialist.",
    ],
    travelStyles: ["food-wine", "cultural"],
  },
  {
    slug: "cape-winelands-private-tasting",
    title: "Private Winelands Estate Tasting",
    category: "Food & Wine",
    destinationSlug: "cape-town",
    heroImage: themeImage("foodAndWine", 2),
    shortDescription: "A private tasting and cellar tour at a Stellenbosch wine estate.",
    description: [
      "A private, guided tasting at a Cape Winelands estate, including a cellar tour and a pairing lunch overlooking the vineyards.",
    ],
    travelStyles: ["food-wine", "luxury"],
  },
  {
    slug: "barcelona-gaudi-private-tour",
    title: "Private Gaudí Architecture Tour",
    category: "Architecture",
    destinationSlug: "barcelona",
    heroImage: themeImage("cityscape", 10),
    shortDescription: "A private architectural historian's tour through Gaudí's Barcelona.",
    description: [
      "A private-guided day through Gaudí's major works, with skip-the-line access arranged at the Sagrada Família.",
    ],
    travelStyles: ["arts-culture", "cultural"],
  },
  {
    slug: "tokyo-sushi-masterclass",
    title: "Private Sushi Masterclass",
    category: "Food & Wine",
    destinationSlug: "tokyo",
    heroImage: themeImage("foodAndWine", 1),
    shortDescription: "A hands-on sushi class led by a chef, including a market visit.",
    description: [
      "A market visit followed by a private hands-on sushi class, led by a chef in a small-group or fully private setting.",
    ],
    travelStyles: ["food-wine", "cultural"],
  },
  {
    slug: "family-treasure-hunt-london",
    title: "Family History Treasure Hunt",
    category: "Family Activities",
    destinationSlug: "london",
    heroImage: themeImage("peopleTravel", 2),
    shortDescription: "A guided, game-based walking tour designed for families with children.",
    description: [
      "A guided walking experience through central London built as a game for children, covering major history along the way without feeling like a lecture tour.",
    ],
    travelStyles: ["family", "cultural"],
  },
  {
    slug: "provence-lavender-photography",
    title: "Lavender Fields Photography Excursion",
    category: "Nature",
    destinationSlug: "paris",
    heroImage: themeImage("mountainNature", 6),
    shortDescription: "A guided drive through Provence's lavender fields at peak bloom, with a private photographer.",
    description: [
      "A seasonal excursion (typically late June through July) through Provence's lavender fields, with a photographer on hand for the group.",
    ],
    travelStyles: ["romance", "relaxation"],
  },
  {
    slug: "auckland-waiheke-wine-day",
    title: "Waiheke Island Wine Day",
    category: "Food & Wine",
    destinationSlug: "auckland",
    heroImage: themeImage("foodAndWine", 2),
    shortDescription: "A private ferry and vineyard-hopping day on Waiheke Island.",
    description: [
      "A day trip by private ferry to Waiheke Island, visiting a curated selection of vineyards with tastings arranged in advance.",
    ],
    travelStyles: ["food-wine", "romance"],
  },
  {
    slug: "corporate-team-sailing-day",
    title: "Corporate Team Sailing Day",
    category: "Events",
    destinationSlug: "barcelona",
    heroImage: themeImage("cruiseAndSea", 0),
    shortDescription: "A chartered sailing day for corporate groups, with an optional team-building format.",
    description: [
      "A chartered boat day for corporate groups — configurable as a purely social afternoon or with a light team-building structure built in.",
    ],
    travelStyles: ["business"],
  },
];

export function getExperience(slug: string) {
  return experiences.find((e) => e.slug === slug);
}

export const experienceCategories = Array.from(new Set(experiences.map((e) => e.category)));
