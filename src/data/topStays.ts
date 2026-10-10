import { unsplashPhoto } from "./images";

/**
 * Well-known places to stay around the world, grouped by continent (Africa
 * is intentionally not listed here). These are named as examples of
 * respected properties in destinations we plan journeys to — World Bridge
 * Meridian is not affiliated with, endorsed by, or in a partnership with
 * any of them, and no rate or availability is implied. Where a photo carries a
 * credit it shows the property itself (Wikimedia Commons); otherwise it shows
 * the destination. Confirm every detail on the
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
  /** Attribution for Wikimedia Commons photos (required by their licenses). */
  credit?: string;
  creditUrl?: string;
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/H%C3%B4tel_Ritz.jpg/960px-H%C3%B4tel_Ritz.jpg",
    credit: "Arthur Weidmann \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:H%C3%B4tel_Ritz.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/H%C3%B4tel_Le_Bristol_Paris.jpg/960px-H%C3%B4tel_Le_Bristol_Paris.jpg",
    credit: "Joeshlabotnik \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:H%C3%B4tel_Le_Bristol_Paris.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Claridge%27s%2C_London-24300565745.jpg/960px-Claridge%27s%2C_London-24300565745.jpg",
    credit: "Chris Sampson \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Claridge%27s,_London-24300565745.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Entrance_to_the_Savoy_Hotel%2C_London_-_geograph.org.uk_-_2281522.jpg/960px-Entrance_to_the_Savoy_Hotel%2C_London_-_geograph.org.uk_-_2281522.jpg",
    credit: "Anthony O'Neil \u00b7 CC BY-SA 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Entrance_to_the_Savoy_Hotel,_London_-_geograph.org.uk_-_2281522.jpg",
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
    heroImage: unsplashPhoto("1694447844469-9c33ad9d2e59"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Hassler_Roma.jpg/960px-Hassler_Roma.jpg",
    credit: "PatriaDeTodos \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hassler_Roma.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Hotel_Cipriani%2C_Venice.jpg/960px-Hotel_Cipriani%2C_Venice.jpg",
    credit: "Morn \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Cipriani,_Venice.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Palazzo_Pisani_Gritti_%28Venice%29.jpg/960px-Palazzo_Pisani_Gritti_%28Venice%29.jpg",
    credit: "Didier Descouens \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Palazzo_Pisani_Gritti_(Venice).jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Villa_il_salviatino%2C_01.JPG/960px-Villa_il_salviatino%2C_01.JPG",
    credit: "sailko \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Villa_il_salviatino,_01.JPG",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Mandarin_Oriental_Barcelona.jpg/960px-Mandarin_Oriental_Barcelona.jpg",
    credit: "Mandarin Oriental Hotel Group \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Mandarin_Oriental_Barcelona.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Hotel_Sacher_Vienna_Sept_2006_002.jpg/960px-Hotel_Sacher_Vienna_Sept_2006_002.jpg",
    credit: "Gryffindor \u00b7 CC BY 2.5 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Sacher_Vienna_Sept_2006_002.jpg",
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
    heroImage: unsplashPhoto("1716481731210-9ff4ee1c1037"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Four_Seasons_Hotel_Gresham_Palace_%2831342741280%29.jpg/960px-Four_Seasons_Hotel_Gresham_Palace_%2831342741280%29.jpg",
    credit: "Jorge Franganillo from Barcelona, Spain \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Four_Seasons_Hotel_Gresham_Palace_(31342741280).jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Athina_Hotel_Grande_Bretagne.jpg/960px-Athina_Hotel_Grande_Bretagne.jpg",
    credit: "Andrzej Otr\u0119bski \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Athina_Hotel_Grande_Bretagne.jpg",
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
    heroImage: unsplashPhoto("1672622851784-0dbd3df4c088"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Ciragan_Palace_2014.JPG/960px-Ciragan_Palace_2014.JPG",
    credit: "This Photo was taken by Wolfgang Moroder. Feel free to use m \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Ciragan_Palace_2014.JPG",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Balmoral_Hotel.jpg/960px-Balmoral_Hotel.jpg",
    credit: "Morgan Johnston \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Balmoral_Hotel.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/New_York_-_Manhattan_-_Plaza_Hotel.jpg/960px-New_York_-_Manhattan_-_Plaza_Hotel.jpg",
    credit: "Yarl \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:New_York_-_Manhattan_-_Plaza_Hotel.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Carlyle_Hotel_Madison_76_jeh.JPG/960px-Carlyle_Hotel_Madison_76_jeh.JPG",
    credit: "Jim.henderson \u00b7 CC0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Carlyle_Hotel_Madison_76_jeh.JPG",
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
    heroImage: unsplashPhoto("1640115587619-eedea026aa95"),
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
    heroImage: unsplashPhoto("1692403435670-c1894e770ecd"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/2009-0722-FairmontSF.jpg/960px-2009-0722-FairmontSF.jpg",
    credit: "Bobak Ha'Eri \u00b7 CC BY 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:2009-0722-FairmontSF.jpg",
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
    heroImage: unsplashPhoto("1660525185695-05d8a6435258"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Four_Seasons_Toronto_2025-05-07.jpg/960px-Four_Seasons_Toronto_2025-05-07.jpg",
    credit: "JK Liu \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Four_Seasons_Toronto_2025-05-07.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Vancouver_Hotel_Georgia_2011.jpg/960px-Vancouver_Hotel_Georgia_2011.jpg",
    credit: "Canadian2006 \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Vancouver_Hotel_Georgia_2011.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Four_Seasons_Hotel_Mexico_City_%2847395931722%29.jpg/960px-Four_Seasons_Hotel_Mexico_City_%2847395931722%29.jpg",
    credit: "Nan Palmero from San Antonio, TX, USA \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Four_Seasons_Hotel_Mexico_City_(47395931722).jpg",
    description:
      "A courtyard hotel on Paseo de la Reforma, near Chapultepec Park and the city's major museums.",
  },
  {
    slug: "copacabana-palace-rio",
    continent: "South America",
    name: "Copacabana Palace, A Belmond Hotel",
    place: "Copacabana, Rio de Janeiro",
    kind: "Beachfront Landmark",
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Hotel_Copacabana_Palace%2C_R%C3%ADo_de_Janeiro_A74224720241122.jpg/960px-Hotel_Copacabana_Palace%2C_R%C3%ADo_de_Janeiro_A74224720241122.jpg",
    credit: "Rjcastillo \u00b7 CC BY 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Copacabana_Palace,_R%C3%ADo_de_Janeiro_A74224720241122.jpg",
    description:
      "A white landmark on Copacabana beach, with a famous pool and views of the Atlantic.",
  },
  {
    slug: "alvear-palace-buenos-aires",
    continent: "South America",
    name: "Alvear Palace Hotel",
    place: "Recoleta, Buenos Aires",
    kind: "Historic Hotel",
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Buenos_Aires_-_Avenida_Alvear_-_20090104-r.jpg/960px-Buenos_Aires_-_Avenida_Alvear_-_20090104-r.jpg",
    credit: "Taken by the uploader, w:es:Usuario:Barcex \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Buenos_Aires_-_Avenida_Alvear_-_20090104-r.jpg",
    description:
      "A Belle Époque-style hotel in Recoleta, close to the cemetery, galleries and Avenida Alvear boutiques.",
  },
  {
    slug: "belmond-monasterio-cusco",
    continent: "South America",
    name: "Monasterio, a Belmond Hotel",
    place: "Historic centre, Cusco",
    kind: "Monastery Hotel",
    heroImage: unsplashPhoto("1733163013310-5778c3ad78b9"),
    description:
      "A converted 16th-century monastery in the historic centre of Cusco, a base for the Sacred Valley.",
  },
  {
    slug: "belmond-sanctuary-lodge-machu-picchu",
    continent: "South America",
    name: "Sanctuary Lodge, a Belmond Hotel",
    place: "Machu Picchu, Peru",
    kind: "Mountain Lodge",
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Turistoj_atendas_buson_por_reveni_de_Ma%C4%89upik%C4%89uo_04.jpg/960px-Turistoj_atendas_buson_por_reveni_de_Ma%C4%89upik%C4%89uo_04.jpg",
    credit: "RG72 \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Turistoj_atendas_buson_por_reveni_de_Ma%C4%89upik%C4%89uo_04.jpg",
    description:
      "The only hotel next to the entrance of Machu Picchu, for early or late hours at the citadel.",
  },
  {
    slug: "explora-patagonia-torres-del-paine",
    continent: "South America",
    name: "Explora Patagonia",
    place: "Torres del Paine, Chile",
    kind: "Adventure Lodge",
    heroImage: unsplashPhoto("1715356758153-6d58ae44e8fe"),
    description:
      "A lodge on the shore of Lake Pehoé in Torres del Paine National Park, built around guided exploration of Patagonia.",
  },
  {
    slug: "sofitel-legend-santa-clara-cartagena",
    continent: "South America",
    name: "Sofitel Legend Santa Clara",
    place: "Old Town, Cartagena",
    kind: "Convent Hotel",
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Hotel_Santa_Clara_00.jpg/960px-Hotel_Santa_Clara_00.jpg",
    credit: "Xemenendura \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Santa_Clara_00.jpg",
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
    heroImage: unsplashPhoto("1513407030348-c983a97b98d8"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Hoshinoya_Kyoto.jpg/960px-Hoshinoya_Kyoto.jpg",
    credit: "Hoshino Resorts \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hoshinoya_Kyoto.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Hotel_Raffles%2C_Singapur%2C_2023-08-16%2C_DD_153-155_HDR.jpg/960px-Hotel_Raffles%2C_Singapur%2C_2023-08-16%2C_DD_153-155_HDR.jpg",
    credit: "Diego Delso \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Raffles,_Singapur,_2023-08-16,_DD_153-155_HDR.jpg",
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
    heroImage: unsplashPhoto("1708885819756-a1afd6ac6008"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/The_Peninsula%2C_Hong_Kong_%28Ank_Kumar%2C_Infosys_Limited%29.jpg/960px-The_Peninsula%2C_Hong_Kong_%28Ank_Kumar%2C_Infosys_Limited%29.jpg",
    credit: "Ank Kumar \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:The_Peninsula,_Hong_Kong_(Ank_Kumar,_Infosys_Limited).jpg",
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
    heroImage: unsplashPhoto("1787422170657-ac3d712ab756"),
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
    heroImage: unsplashPhoto("1602002418679-43121356bf41"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Amangalla_facade.jpg/960px-Amangalla_facade.jpg",
    credit: "Dan arndt \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Amangalla_facade.jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Sofitel_Legend_Metropole_Hotel%2C_Hanoi%2C_1901_%283%29_%2826721073449%29.jpg/960px-Sofitel_Legend_Metropole_Hotel%2C_Hanoi%2C_1901_%283%29_%2826721073449%29.jpg",
    credit: "Richard Mortel from Riyadh, Saudi Arabia \u00b7 CC BY 2.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sofitel_Legend_Metropole_Hotel,_Hanoi,_1901_(3)_(26721073449).jpg",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Madinat_Jumeirah-Dubai3303.JPG/960px-Madinat_Jumeirah-Dubai3303.JPG",
    credit: "Diego Delso \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Madinat_Jumeirah-Dubai3303.JPG",
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Emirates_Palace_-_55482144754.jpg/960px-Emirates_Palace_-_55482144754.jpg",
    credit: "xiquinhosilva \u00b7 CC BY 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Emirates_Palace_-_55482144754.jpg",
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
    heroImage: unsplashPhoto("1685113872064-de4180a0ea93"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Sydney_Harbour_Bridge%2C_2017_%2803%29.jpg/960px-Sydney_Harbour_Bridge%2C_2017_%2803%29.jpg",
    credit: "Bahnfrend \u00b7 CC BY-SA 4.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:Sydney_Harbour_Bridge,_2017_(03).jpg",
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
    heroImage: unsplashPhoto("1624324969215-7ddb79ad73c9"),
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
    heroImage: unsplashPhoto("1705927161510-0e84f8e1901e"),
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
    heroImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/DL2A_Four_Seasons_Bora_Bora_20.jpg/960px-DL2A_Four_Seasons_Bora_Bora_20.jpg",
    credit: "Didierlefort \u00b7 CC BY-SA 3.0 \u00b7 Wikimedia Commons",
    creditUrl: "https://commons.wikimedia.org/wiki/File:DL2A_Four_Seasons_Bora_Bora_20.jpg",
    description:
      "Overwater bungalows on Motu Tehotu, facing Mount Otemanu across the lagoon.",
  },
];
