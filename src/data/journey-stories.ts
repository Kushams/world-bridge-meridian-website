import { JourneyStory } from "./types";
import { themeGallery, themeImage } from "./images";

/**
 * Journey Stories are editorial, magazine-style treatments of journeys we
 * design — distinct from the catalog-style /travel-packages listings.
 * Illustrative journeys, not confirmed departures; pricing is indicative.
 */
export const journeyStories: JourneyStory[] = [
  {
    slug: "a-week-in-italy-curated-around-art",
    title: "A Week in Italy, Curated Around Art",
    subtitle: "Rome → Florence → Venice",
    duration: "10 Days",
    travelerType: "Family",
    travelStyles: ["arts-culture", "family"],
    heroImage: themeImage("culturalHeritage", 0),
    gallery: [
      themeImage("culturalHeritage", 0),
      themeImage("culturalHeritage", 7),
      themeImage("culturalHeritage", 8),
    ],
    overview: [
      "Italy rewards travelers who slow down enough to actually look. This journey threads Rome, Florence and Venice together not as a checklist of monuments, but as a study in how art, architecture and daily life have shaped each other for two thousand years.",
      "Mornings are spent with a private guide in front of the work that matters — the Sistine Chapel before the crowds, the Uffizi's Botticelli room, a quiet campo in Venice most visitors never find. Afternoons are left open.",
    ],
    whyThisJourney:
      "Most Italy itineraries move too fast to actually see anything. This one is built around three or four unhurried mornings with real access — private viewing time, a guide who knows the curators — rather than a checklist of twelve churches in two days.",
    route: [
      { city: "Rome", nights: 3 },
      { city: "Florence", nights: 3 },
      { city: "Venice", nights: 3 },
    ],
    itinerary: [
      { day: "Day 1–3", title: "Rome", description: "Private early access to the Vatican Museums and Sistine Chapel, the Borghese Gallery, and an evening walking the historic center." },
      { day: "Day 4–6", title: "Florence", description: "The Uffizi and Accademia with an art historian, a Tuscan countryside day trip, and a private Duomo dome climb." },
      { day: "Day 7–9", title: "Venice", description: "The Accademia and Peggy Guggenheim Collection, a glassblowing atelier visit on Murano, and a private evening gondola crossing." },
      { day: "Day 10", title: "Departure", description: "Transfer to Venice Marco Polo Airport." },
    ],
    experiences: [
      "Private early-access museum entry in each city",
      "An art historian guide for gallery mornings",
      "A glassblowing atelier visit on Murano",
      "A Tuscan countryside day trip with a working vineyard lunch",
    ],
    accommodationStyle: "Well-located four- and five-star hotels within walking distance of each city's historic center.",
    culturalHighlights: [
      "The Sistine Chapel and Vatican Museums",
      "The Uffizi Gallery and Accademia di Firenze",
      "The Peggy Guggenheim Collection, Venice",
    ],
    indicativePricing: [{ label: "From", amount: 7400, currency: "USD", unit: "for a family of four" }],
    destinationSlugs: ["rome", "florence", "venice"],
  },
  {
    slug: "opera-nights-and-imperial-vienna",
    title: "Opera Nights and Imperial Vienna",
    subtitle: "Vienna, in full",
    duration: "6 Days",
    travelerType: "Couple",
    travelStyles: ["arts-culture", "romance"],
    heroImage: themeImage("culturalHeritage", 11),
    gallery: [
      themeImage("culturalHeritage", 11),
      themeImage("culturalHeritage", 7),
      themeImage("culturalHeritage", 8),
    ],
    overview: [
      "Vienna is one of the few cities where classical music is still a living, everyday thing rather than a museum piece. This journey is built around evenings at the opera and the Musikverein, with the city's imperial architecture as the backdrop between performances.",
      "We handle the parts that are hardest to arrange independently — good seats to sold-out performances, and a schedule built around what's actually on rather than what a fixed itinerary assumes.",
    ],
    whyThisJourney:
      "Opera and concert tickets in Vienna are notoriously difficult to secure well for a specific week without local relationships. We build the itinerary around the season's actual program, not the other way around.",
    route: [{ city: "Vienna", nights: 5 }],
    itinerary: [
      { day: "Day 1–2", title: "First Impressions", description: "Schönbrunn Palace, the Ringstrasse, and an orientation walk through the historic center." },
      { day: "Day 3", title: "The Museums", description: "The Kunsthistorisches Museum and the Belvedere's Klimt collection." },
      { day: "Day 4", title: "Opera Night", description: "A performance at the Vienna State Opera, with a pre-performance dinner nearby." },
      { day: "Day 5", title: "The Musikverein", description: "A concert at one of the world's great acoustic halls, followed by a Heurigen wine-tavern evening." },
      { day: "Day 6", title: "Departure", description: "Transfer to Vienna International Airport." },
    ],
    experiences: [
      "Reserved seating at the Vienna State Opera",
      "A performance at the Musikverein",
      "A private Belvedere and Kunsthistorisches Museum tour",
      "An evening at a traditional Heurigen wine tavern",
    ],
    accommodationStyle: "A five-star hotel within walking distance of the Ringstrasse and the State Opera.",
    culturalHighlights: [
      "The Vienna State Opera",
      "Klimt's The Kiss at the Belvedere",
      "The Kunsthistorisches Museum",
    ],
    indicativePricing: [{ label: "From", amount: 5200, currency: "USD", unit: "per couple" }],
    destinationSlugs: ["vienna"],
  },
  {
    slug: "cape-town-to-victoria-falls",
    title: "Cape Town to Victoria Falls",
    subtitle: "Cape Town → Victoria Falls",
    duration: "9 Days",
    travelerType: "Couple",
    travelStyles: ["adventure", "luxury"],
    heroImage: themeImage("safari", 0),
    gallery: themeGallery("safari", 2, 0),
    overview: [
      "This journey pairs two of Southern Africa's most distinct landscapes: Cape Town's coastline and wine country, and the raw scale of Victoria Falls. It's a journey about contrast — city and wilderness, ocean and river, table-set dinners and open-air safari drives.",
      "We connect the two with a private charter flight rather than a commercial connection with a long layover, keeping the pace intact.",
    ],
    whyThisJourney:
      "Cape Town and Victoria Falls are rarely combined well because the logistics between them are genuinely difficult to arrange independently. We handle the charter routing and the on-the-ground guiding at both ends.",
    route: [
      { city: "Cape Town", nights: 4 },
      { city: "Victoria Falls", nights: 4 },
    ],
    itinerary: [
      { day: "Day 1–4", title: "Cape Town", description: "Table Mountain, a Constantia wine estate day, and a Cape Peninsula drive to Boulders Beach and Cape Point." },
      { day: "Day 5", title: "Charter to Victoria Falls", description: "Private charter flight over the Kalahari to Victoria Falls." },
      { day: "Day 6–8", title: "Victoria Falls", description: "Guided walks along the Falls, a sunset cruise on the Zambezi, and game drives in Zambezi National Park." },
      { day: "Day 9", title: "Departure", description: "Transfer to Victoria Falls Airport." },
    ],
    experiences: [
      "A private Constantia wine estate lunch",
      "A private charter flight between Cape Town and Victoria Falls",
      "A sunset cruise on the Zambezi River",
      "Guided game drives in Zambezi National Park",
    ],
    accommodationStyle: "A boutique Cape Town townhouse hotel, followed by a riverside lodge overlooking the Zambezi.",
    culturalHighlights: [
      "Table Mountain National Park",
      "The Constantia wine valley",
      "Victoria Falls, one of the Seven Natural Wonders of the World",
    ],
    indicativePricing: [{ label: "From", amount: 9800, currency: "USD", unit: "per couple" }],
    destinationSlugs: ["cape-town", "victoria-falls"],
  },
  {
    slug: "greek-islands-slowly",
    title: "Greek Islands, Slowly",
    subtitle: "Athens → Santorini",
    duration: "8 Days",
    travelerType: "Couple",
    travelStyles: ["romance", "cultural"],
    heroImage: themeImage("coastal", 0),
    gallery: themeGallery("coastal", 4, 0),
    overview: [
      "This is a journey built around doing less, better. A few days in Athens with the Acropolis and its museum, then a slow ferry crossing to Santorini for a week with almost nothing scheduled beyond a sunset dinner reservation and a private caldera sail.",
      "We deliberately avoid stacking islands — the whole point of this itinerary is the pace, not the number of stamps.",
    ],
    whyThisJourney:
      "Most Greek island itineraries try to cover three or four islands in a week and end up feeling like a series of ferry terminals. This one trades breadth for depth and rest.",
    route: [
      { city: "Athens", nights: 3 },
      { city: "Santorini", nights: 4 },
    ],
    itinerary: [
      { day: "Day 1–3", title: "Athens", description: "The Acropolis and Acropolis Museum, the Plaka district, and a day trip to Cape Sounion." },
      { day: "Day 4", title: "Ferry to Santorini", description: "A daytime high-speed ferry crossing to Santorini." },
      { day: "Day 5–7", title: "Santorini", description: "A private caldera sunset sail, a wine-estate lunch, and largely unscheduled days in Oia and Imerovigli." },
      { day: "Day 8", title: "Departure", description: "Transfer to Santorini Airport." },
    ],
    experiences: [
      "A private Acropolis Museum tour",
      "A private caldera sunset sailing trip",
      "A Santorini wine-estate lunch",
      "A sunset dinner reservation in Oia",
    ],
    accommodationStyle: "A boutique hotel near the Plaka in Athens, then a caldera-view suite in Santorini.",
    culturalHighlights: [
      "The Acropolis and Parthenon",
      "The Acropolis Museum",
      "Oia's Cycladic architecture",
    ],
    indicativePricing: [{ label: "From", amount: 6100, currency: "USD", unit: "per couple" }],
    destinationSlugs: ["athens", "santorini"],
  },
];

export function getJourneyStory(slug: string) {
  return journeyStories.find((s) => s.slug === slug);
}
