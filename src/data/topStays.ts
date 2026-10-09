import { themeImage, type ImageTheme } from "./images";

/**
 * Well-known places to stay around the world, grouped by continent (Africa
 * is intentionally not listed here). These are named as examples of
 * respected properties in destinations we plan journeys to — World Bridge
 * Meridian is not affiliated with, endorsed by, or in a partnership with
 * any of them, and no rate or availability is implied. Photography is
 * illustrative, not of the property. Confirm every detail on the
 * property's own website. Descriptions were fact-checked against official and
 * reputable sources in October 2026 (re-check before relying on openings or
 * closures); see partners.ts for what is actually confirmed.
 */
export type StayContinent =
  | "Europe"
  | "North America"
  | "South America"
  | "Asia"
  | "Middle East"
  | "Oceania";

export interface NotableStay {
  slug: string;
  continent: StayContinent;
  name: string;
  place: string;
  kind: string;
  /** Matches a destination page when we have one for that city. */
  destinationSlug?: string;
  heroImage: string;
  description: string;
}

export const stayContinents: StayContinent[] = [
  "Europe",
  "North America",
  "South America",
  "Asia",
  "Middle East",
  "Oceania",
];

export const notableStays: NotableStay[] = [
  {
    slug: "the-ritz-paris",
    continent: "Europe",
    name: "The Ritz Paris",
    place: "Place Vendôme, Paris",
    kind: "Historic Palace Hotel",
    destinationSlug: "paris",
    heroImage: themeImage("cityscape" as ImageTheme, 1),
    description:
      "A legendary address on Place Vendôme, in the heart of Paris, steps from the Tuileries and the Louvre.",
  },
  {
    slug: "le-bristol-paris",
    continent: "Europe",
    name: "Le Bristol Paris",
    place: "Faubourg Saint-Honoré, Paris",
    kind: "Luxury Hotel",
    destinationSlug: "paris",
    heroImage: themeImage("cityscape" as ImageTheme, 2),
    description:
      "A Parisian palace hotel on the Faubourg Saint-Honoré, known for its garden courtyard and fashion-district setting.",
  },
  {
    slug: "claridges-london",
    continent: "Europe",
    name: "Claridge's",
    place: "Mayfair, London",
    kind: "Art Deco Landmark",
    destinationSlug: "london",
    heroImage: themeImage("cityscape" as ImageTheme, 3),
    description:
      "A Mayfair institution with Art Deco interiors, close to Bond Street, Regent Street and the West End galleries.",
  },
  {
    slug: "the-savoy-london",
    continent: "Europe",
    name: "The Savoy",
    place: "The Strand, London",
    kind: "Historic Hotel",
    destinationSlug: "london",
    heroImage: themeImage("cityscape" as ImageTheme, 4),
    description:
      "London's riverside grande dame on the Strand, between Covent Garden, the theatres and the Thames.",
  },
  {
    slug: "hotel-de-russie-rome",
    continent: "Europe",
    name: "Hotel de Russie",
    place: "Near Piazza del Popolo, Rome",
    kind: "Luxury Hotel",
    destinationSlug: "rome",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 1),
    description:
      "A quiet retreat between the Spanish Steps and Villa Borghese, known for its terraced garden in the middle of Rome.",
  },
  {
    slug: "hotel-hassler-rome",
    continent: "Europe",
    name: "Hotel Hassler Roma",
    place: "Top of the Spanish Steps, Rome",
    kind: "Luxury Hotel",
    destinationSlug: "rome",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 2),
    description:
      "Perched at the top of the Spanish Steps with views across the rooftops and domes of Rome.",
  },
  {
    slug: "belmond-cipriani-venice",
    continent: "Europe",
    name: "Hotel Cipriani, A Belmond Hotel",
    place: "Giudecca, Venice",
    kind: "Luxury Hotel",
    destinationSlug: "venice",
    heroImage: themeImage("coastal" as ImageTheme, 1),
    description:
      "A secluded address on the island of Giudecca, with gardens and a pool, facing St Mark's across the water. Closed for renovation; due to reopen on 1 June 2027.",
  },
  {
    slug: "the-gritti-palace-venice",
    continent: "Europe",
    name: "The Gritti Palace",
    place: "Grand Canal, Venice",
    kind: "Palazzo Hotel",
    destinationSlug: "venice",
    heroImage: themeImage("coastal" as ImageTheme, 2),
    description:
      "A Gothic-era palazzo hotel on the Grand Canal, close to the Accademia and Santa Maria della Salute.",
  },
  {
    slug: "il-salviatino-florence",
    continent: "Europe",
    name: "Il Salviatino",
    place: "Hills above Florence",
    kind: "Historic Villa",
    destinationSlug: "florence",
    heroImage: themeImage("mountainNature" as ImageTheme, 4),
    description:
      "A restored Renaissance villa on the hillside above Florence, with gardens and views of the city.",
  },
  {
    slug: "mandarin-oriental-barcelona",
    continent: "Europe",
    name: "Mandarin Oriental, Barcelona",
    place: "Passeig de Gràcia, Barcelona",
    kind: "Luxury Hotel",
    destinationSlug: "barcelona",
    heroImage: themeImage("cityscape" as ImageTheme, 5),
    description:
      "On Passeig de Gràcia, among Barcelona's Modernista architecture, shopping and tapas bars.",
  },
  {
    slug: "hotel-sacher-vienna",
    continent: "Europe",
    name: "Hotel Sacher Wien",
    place: "Behind the State Opera, Vienna",
    kind: "Historic Hotel",
    destinationSlug: "vienna",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 3),
    description:
      "A classic Viennese hotel beside the State Opera, famous for its café and the original Sachertorte.",
  },
  {
    slug: "augustine-prague",
    continent: "Europe",
    name: "Augustine, a Luxury Collection Hotel",
    place: "Malá Strana, Prague",
    kind: "Historic Monastery Hotel",
    destinationSlug: "prague",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 4),
    description:
      "A hotel in Malá Strana set within a medieval monastery complex, below Prague Castle.",
  },
  {
    slug: "four-seasons-gresham-budapest",
    continent: "Europe",
    name: "Four Seasons Hotel Gresham Palace",
    place: "Chain Bridge, Budapest",
    kind: "Art Nouveau Landmark",
    destinationSlug: "budapest",
    heroImage: themeImage("cityscape" as ImageTheme, 6),
    description:
      "An Art Nouveau palace beside the Chain Bridge, with views over the Danube to Buda Castle.",
  },
  {
    slug: "hotel-grande-bretagne-athens",
    continent: "Europe",
    name: "Hotel Grande Bretagne, a Luxury Collection Hotel",
    place: "Syntagma Square, Athens",
    kind: "Historic Hotel",
    destinationSlug: "athens",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 5),
    description:
      "On Syntagma Square, with rooftop views of the Acropolis and Parthenon.",
  },
  {
    slug: "canaves-oia-santorini",
    continent: "Europe",
    name: "Canaves Oia Suites",
    place: "Oia, Santorini",
    kind: "Cliffside Suites",
    destinationSlug: "santorini",
    heroImage: themeImage("coastal" as ImageTheme, 0),
    description:
      "Whitewashed cave-style suites in Oia, many with plunge pools, facing the Santorini caldera.",
  },
  {
    slug: "ciragan-palace-istanbul",
    continent: "Europe",
    name: "Çırağan Palace Kempinski",
    place: "Bosphorus shore, Istanbul",
    kind: "Ottoman Palace Hotel",
    destinationSlug: "istanbul",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 6),
    description:
      "A former Ottoman palace on the shore of the Bosphorus, with an outdoor pool at the water's edge.",
  },
  {
    slug: "the-balmoral-edinburgh",
    continent: "Europe",
    name: "The Balmoral",
    place: "Princes Street, Edinburgh",
    kind: "Historic Hotel",
    destinationSlug: "edinburgh",
    heroImage: themeImage("cityscape" as ImageTheme, 7),
    description:
      "The clock-tower landmark on Princes Street, beside Waverley Station and the Old Town.",
  },
  {
    slug: "the-plaza-new-york",
    continent: "North America",
    name: "The Plaza",
    place: "Fifth Avenue, New York",
    kind: "Historic Hotel",
    destinationSlug: "new-york",
    heroImage: themeImage("cityscape" as ImageTheme, 5),
    description:
      "The landmark on Fifth Avenue facing Central Park, in the middle of Midtown's shopping and museums.",
  },
  {
    slug: "the-carlyle-new-york",
    continent: "North America",
    name: "The Carlyle, A Rosewood Hotel",
    place: "Upper East Side, New York",
    kind: "Luxury Hotel",
    destinationSlug: "new-york",
    heroImage: themeImage("cityscape" as ImageTheme, 0),
    description:
      "An Upper East Side classic on Madison Avenue, within walking distance of Museum Mile.",
  },
  {
    slug: "hotel-bel-air-los-angeles",
    continent: "North America",
    name: "Hotel Bel-Air",
    place: "Bel-Air, Los Angeles",
    kind: "Garden Hotel",
    destinationSlug: "los-angeles",
    heroImage: themeImage("luxuryResort" as ImageTheme, 2),
    description:
      "A garden hotel in the Bel-Air hills, with a lake and Spanish mission-style courtyards.",
  },
  {
    slug: "the-setai-miami-beach",
    continent: "North America",
    name: "The Setai, Miami Beach",
    place: "South Beach, Miami",
    kind: "Beachfront Hotel",
    destinationSlug: "miami",
    heroImage: themeImage("tropicalBeach" as ImageTheme, 1),
    description:
      "A beachfront hotel in an Art Deco building on Collins Avenue, with a calm, spa-like design.",
  },
  {
    slug: "fairmont-san-francisco",
    continent: "North America",
    name: "Fairmont San Francisco",
    place: "Nob Hill, San Francisco",
    kind: "Historic Hotel",
    destinationSlug: "san-francisco",
    heroImage: themeImage("cityscape" as ImageTheme, 2),
    description:
      "A hilltop landmark on Nob Hill, a cable-car ride from Chinatown and Union Square.",
  },
  {
    slug: "the-langham-chicago",
    continent: "North America",
    name: "The Langham, Chicago",
    place: "Chicago River, Chicago",
    kind: "Luxury Hotel",
    destinationSlug: "chicago",
    heroImage: themeImage("cityscape" as ImageTheme, 3),
    description:
      "Set in a Mies van der Rohe building on the Chicago River, close to the Loop and the Art Institute.",
  },
  {
    slug: "four-seasons-toronto",
    continent: "North America",
    name: "Four Seasons Hotel Toronto",
    place: "Yorkville, Toronto",
    kind: "Luxury Hotel",
    destinationSlug: "toronto",
    heroImage: themeImage("cityscape" as ImageTheme, 4),
    description:
      "In Yorkville, a short walk from the Royal Ontario Museum and some of Toronto's best shopping and dining.",
  },
  {
    slug: "rosewood-hotel-georgia-vancouver",
    continent: "North America",
    name: "Rosewood Hotel Georgia",
    place: "Downtown Vancouver",
    kind: "Historic Hotel",
    destinationSlug: "vancouver",
    heroImage: themeImage("cityscape" as ImageTheme, 6),
    description:
      "A heritage hotel in downtown Vancouver, close to the waterfront, galleries and Stanley Park.",
  },
  {
    slug: "four-seasons-mexico-city",
    continent: "North America",
    name: "Four Seasons Hotel Mexico City",
    place: "Paseo de la Reforma, Mexico City",
    kind: "Luxury Hotel",
    destinationSlug: "mexico-city",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 7),
    description:
      "A courtyard hotel on Paseo de la Reforma, near Chapultepec Park and the city's major museums.",
  },
  {
    slug: "copacabana-palace-rio",
    continent: "South America",
    name: "Copacabana Palace, A Belmond Hotel",
    place: "Copacabana, Rio de Janeiro",
    kind: "Beachfront Landmark",
    heroImage: themeImage("tropicalBeach" as ImageTheme, 2),
    description:
      "A white landmark on Copacabana beach, with a famous pool and views of the Atlantic.",
  },
  {
    slug: "alvear-palace-buenos-aires",
    continent: "South America",
    name: "Alvear Palace Hotel",
    place: "Recoleta, Buenos Aires",
    kind: "Historic Hotel",
    heroImage: themeImage("cityscape" as ImageTheme, 8),
    description:
      "A Belle Époque-style hotel in Recoleta, close to the cemetery, galleries and Avenida Alvear boutiques.",
  },
  {
    slug: "belmond-monasterio-cusco",
    continent: "South America",
    name: "Monasterio, a Belmond Hotel",
    place: "Historic centre, Cusco",
    kind: "Monastery Hotel",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 7),
    description:
      "A converted 16th-century monastery in the historic centre of Cusco, a base for the Sacred Valley.",
  },
  {
    slug: "belmond-sanctuary-lodge-machu-picchu",
    continent: "South America",
    name: "Sanctuary Lodge, a Belmond Hotel",
    place: "Machu Picchu, Peru",
    kind: "Mountain Lodge",
    heroImage: themeImage("mountainNature" as ImageTheme, 3),
    description:
      "The only hotel next to the entrance of Machu Picchu, for early or late hours at the citadel.",
  },
  {
    slug: "explora-patagonia-torres-del-paine",
    continent: "South America",
    name: "Explora Patagonia",
    place: "Torres del Paine, Chile",
    kind: "Adventure Lodge",
    heroImage: themeImage("adventure" as ImageTheme, 1),
    description:
      "A lodge on the shore of Lake Pehoé in Torres del Paine National Park, built around guided exploration of Patagonia.",
  },
  {
    slug: "sofitel-legend-santa-clara-cartagena",
    continent: "South America",
    name: "Sofitel Legend Santa Clara",
    place: "Old Town, Cartagena",
    kind: "Convent Hotel",
    heroImage: themeImage("coastal" as ImageTheme, 3),
    description:
      "A former 17th-century convent in Cartagena's walled Old Town, with a courtyard and pool.",
  },
  {
    slug: "aman-tokyo",
    continent: "Asia",
    name: "Aman Tokyo",
    place: "Otemachi, Tokyo",
    kind: "Luxury Hotel",
    destinationSlug: "tokyo",
    heroImage: themeImage("cityscape" as ImageTheme, 8),
    description:
      "High in a tower in Otemachi, with views over the Imperial Palace gardens and a Japanese-influenced design.",
  },
  {
    slug: "hoshinoya-kyoto",
    continent: "Asia",
    name: "Hoshinoya Kyoto",
    place: "Arashiyama, Kyoto",
    kind: "Riverside Ryokan",
    destinationSlug: "kyoto",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 8),
    description:
      "A riverside ryokan in Arashiyama, reached by boat, in the tradition of Japanese inns.",
  },
  {
    slug: "raffles-singapore",
    continent: "Asia",
    name: "Raffles Hotel Singapore",
    place: "Civic District, Singapore",
    kind: "Colonial Landmark",
    destinationSlug: "singapore",
    heroImage: themeImage("cityscape" as ImageTheme, 9),
    description:
      "Singapore's colonial landmark, known for its arcades, courtyards and the Long Bar.",
  },
  {
    slug: "mandarin-oriental-bangkok",
    continent: "Asia",
    name: "Mandarin Oriental, Bangkok",
    place: "Chao Phraya River, Bangkok",
    kind: "Riverside Hotel",
    destinationSlug: "bangkok",
    heroImage: themeImage("cityscape" as ImageTheme, 10),
    description:
      "A storied riverside hotel on the Chao Phraya, reached by river shuttle boat from the Skytrain.",
  },
  {
    slug: "the-peninsula-hong-kong",
    continent: "Asia",
    name: "The Peninsula Hong Kong",
    place: "Tsim Sha Tsui, Hong Kong",
    kind: "Historic Hotel",
    destinationSlug: "hong-kong",
    heroImage: themeImage("cityscape" as ImageTheme, 11),
    description:
      "A harbour-front landmark in Tsim Sha Tsui, facing Victoria Harbour and the Hong Kong Island skyline.",
  },
  {
    slug: "four-seasons-sayan-bali",
    continent: "Asia",
    name: "Four Seasons Resort Bali at Sayan",
    place: "Ubud, Bali",
    kind: "Jungle Resort",
    destinationSlug: "bali",
    heroImage: themeImage("luxuryResort" as ImageTheme, 3),
    description:
      "A resort above the Ayung River valley near Ubud, among rice terraces and jungle.",
  },
  {
    slug: "soneva-fushi-maldives",
    continent: "Asia",
    name: "Soneva Fushi",
    place: "Baa Atoll, Maldives",
    kind: "Island Resort",
    destinationSlug: "maldives",
    heroImage: themeImage("tropicalBeach" as ImageTheme, 3),
    description:
      "A barefoot-luxury island resort in the Baa Atoll, a UNESCO Biosphere Reserve.",
  },
  {
    slug: "amangalla-galle",
    continent: "Asia",
    name: "Amangalla",
    place: "Galle Fort, Sri Lanka",
    kind: "Colonial Hotel",
    destinationSlug: "sri-lanka",
    heroImage: themeImage("coastal" as ImageTheme, 4),
    description:
      "A colonial-era hotel inside the UNESCO-listed Galle Fort, on the southern coast.",
  },
  {
    slug: "metropole-hanoi",
    continent: "Asia",
    name: "Sofitel Legend Metropole Hanoi",
    place: "Hoan Kiem, Hanoi",
    kind: "Colonial Landmark",
    destinationSlug: "hanoi",
    heroImage: themeImage("culturalHeritage" as ImageTheme, 9),
    description:
      "A French colonial hotel dating from 1901, in Hanoi's French Quarter, a short walk from the Opera House and Hoan Kiem Lake.",
  },
  {
    slug: "burj-al-arab-dubai",
    continent: "Middle East",
    name: "Burj Al Arab Jumeirah",
    place: "Jumeirah Beach, Dubai",
    kind: "Iconic Hotel",
    destinationSlug: "dubai",
    heroImage: themeImage("desertArchitecture" as ImageTheme, 1),
    description:
      "The sail-shaped landmark on its own island off Jumeirah Beach, one of Dubai's most recognisable buildings. The hotel is closed for a restoration expected to last until around late 2027.",
  },
  {
    slug: "emirates-palace-abu-dhabi",
    continent: "Middle East",
    name: "Emirates Palace Mandarin Oriental, Abu Dhabi",
    place: "Corniche, Abu Dhabi",
    kind: "Palace Hotel",
    destinationSlug: "abu-dhabi",
    heroImage: themeImage("desertArchitecture" as ImageTheme, 2),
    description:
      "A palace-style hotel on the western end of Abu Dhabi's Corniche, with a private beachfront and a short drive from downtown.",
  },
  {
    slug: "mandarin-oriental-doha",
    continent: "Middle East",
    name: "Mandarin Oriental, Doha",
    place: "Msheireb Downtown, Doha",
    kind: "Luxury Hotel",
    destinationSlug: "doha",
    heroImage: themeImage("desertArchitecture" as ImageTheme, 3),
    description:
      "In Msheireb Downtown Doha, a short distance from Souq Waqif and the Museum of Islamic Art.",
  },
  {
    slug: "park-hyatt-sydney",
    continent: "Oceania",
    name: "Park Hyatt Sydney",
    place: "The Rocks, Sydney",
    kind: "Harbourfront Hotel",
    destinationSlug: "sydney",
    heroImage: themeImage("cityscape" as ImageTheme, 12),
    description:
      "On the harbour at The Rocks, with views of the Opera House and Sydney Harbour Bridge.",
  },
  {
    slug: "the-langham-melbourne",
    continent: "Oceania",
    name: "The Langham, Melbourne",
    place: "Southbank, Melbourne",
    kind: "Luxury Hotel",
    destinationSlug: "melbourne",
    heroImage: themeImage("cityscape" as ImageTheme, 13),
    description:
      "On the Yarra River in Southbank, a short walk to the Arts Precinct and the city centre.",
  },
  {
    slug: "matakauri-lodge-queenstown",
    continent: "Oceania",
    name: "Matakauri Lodge",
    place: "Near Queenstown, New Zealand",
    kind: "Mountain Lodge",
    destinationSlug: "queenstown",
    heroImage: themeImage("mountainNature" as ImageTheme, 5),
    description:
      "A lodge on the shores of Lake Wakatipu with views of the Remarkables mountain range.",
  },
  {
    slug: "four-seasons-bora-bora",
    continent: "Oceania",
    name: "Four Seasons Resort Bora Bora",
    place: "Motu Tehotu, Bora Bora",
    kind: "Overwater Resort",
    destinationSlug: "bora-bora",
    heroImage: themeImage("tropicalBeach" as ImageTheme, 4),
    description:
      "Overwater bungalows on Motu Tehotu, facing Mount Otemanu across the lagoon.",
  },
];
