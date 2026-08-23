export type TravelStyleSlug =
  | "luxury"
  | "cultural"
  | "adventure"
  | "relaxation"
  | "romance"
  | "family"
  | "arts-culture"
  | "cruise"
  | "food-wine"
  | "wellness"
  | "business"
  | "bespoke";

export interface PriceTier {
  label: string; // "From"
  amount: number;
  currency: string; // "USD"
  unit: string; // "per person" | "for a family of four" | "per couple" | "per person, per night"
}

export interface ItineraryDay {
  day: string; // "Day 1–2"
  title: string;
  description: string;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region:
    | "North America"
    | "Europe"
    | "Middle East & Africa"
    | "Asia-Pacific"
    | "Indian Ocean & Islands";
  heroImage: string;
  gallery: string[];
  shortDescription: string;
  description: string[];
  travelStyles: TravelStyleSlug[];
  highlights: string[];
  recommendedStays: string[];
  sampleItinerary: ItineraryDay[];
  bestTravelPeriods: string[];
  indicativePricing: PriceTier[];
  cruiseAvailable?: boolean;
  featured?: boolean;
}

export interface TravelPackage {
  slug: string;
  title: string;
  destinationSlugs: string[];
  travelStyles: TravelStyleSlug[];
  duration: string; // "10 days / 9 nights"
  travelerType: string; // "Family" | "Couple" | "Group" | ...
  heroImage: string;
  gallery: string[];
  shortDescription: string;
  overview: string[];
  whoItsFor: string;
  itinerary: ItineraryDay[];
  accommodation: string;
  includes: string[];
  excludes: string[];
  indicativePricing: PriceTier[];
  featured?: boolean;
}

export interface Cruise {
  slug: string;
  title: string;
  category: string; // "Mediterranean" | "Caribbean" | ...
  operator: string; // generic descriptor, not a real named operator
  ship: string; // generic descriptor
  duration: string;
  departurePort: string;
  travelPeriod: string;
  cabinCategories: string[];
  heroImage: string;
  gallery: string[];
  description: string[];
  ports: string[];
  includes: string[];
  excludes: string[];
  sampleItinerary: ItineraryDay[];
  indicativePricing: PriceTier[];
  status: "Sample Journey" | "Indicative Journey" | "Enquiry-Based Journey";
}

export interface Experience {
  slug: string;
  title: string;
  category: string;
  destinationSlug?: string;
  heroImage: string;
  shortDescription: string;
  description: string[];
  travelStyles: TravelStyleSlug[];
}

export interface Review {
  id: string;
  name: string;
  destination: string;
  tripType: TravelStyleSlug;
  year: number;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  image: string;
  sample: true;
}

export interface Partner {
  category: string;
  description: string;
}

export interface TeamMember {
  slug: string;
  name: string | null;
  title: string;
  department: string;
  reportsToSlug?: string;
  bio: string[] | null;
  focusAreas?: string[];
  photo?: string;
  placeholder?: boolean;
}

export interface JournalArticle {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO date
  author: string;
  readingTime: string;
  heroImage: string;
  excerpt: string;
  body: string[];
  relatedDestinationSlugs?: string[];
}

export interface CurrentJourney {
  slug: string;
  title: string;
  destinationSlugs: string[];
  travelPeriod: string;
  duration: string;
  travelType: string;
  heroImage: string;
  indicativePricing: PriceTier;
  status: "Sample Journey" | "Indicative Journey" | "Enquiry-Based Journey";
}

export interface RouteStop {
  city: string;
  nights: number;
}

export interface JourneyStory {
  slug: string;
  title: string;
  subtitle: string; // e.g. "Rome → Florence → Venice"
  duration: string;
  travelerType: string;
  travelStyles: TravelStyleSlug[];
  heroImage: string;
  gallery: string[];
  overview: string[];
  whyThisJourney: string;
  route: RouteStop[];
  itinerary: ItineraryDay[];
  experiences: string[];
  accommodationStyle: string;
  culturalHighlights: string[];
  indicativePricing: PriceTier[];
  destinationSlugs: string[];
}

export interface Stay {
  slug: string;
  name: string; // generic descriptive name, not a real hotel brand
  category:
    | "Luxury Hotels"
    | "Boutique Hotels"
    | "Resorts"
    | "Villas"
    | "Family-Friendly Stays"
    | "Cultural-Located Stays"
    | "Cruise Accommodation";
  destinationSlug: string;
  heroImage: string;
  description: string;
}
