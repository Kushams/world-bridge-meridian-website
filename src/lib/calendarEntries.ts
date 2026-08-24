import { artListings, type ArtListing } from "@/data/exhibitions";
import { worldEvents, eventCategoryLabels, type WorldEvent } from "@/data/events";

export interface CalendarEntry {
  slug: string;
  sectionKey: string;
  sectionLabel: string;
  title: string;
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

const artSectionLabels: Record<ArtListing["category"], string> = {
  gallery: "Gallery Exhibitions",
  museum: "Museum Exhibitions",
  fair: "Art Fairs",
};

function fromArtListing(a: ArtListing): CalendarEntry {
  return {
    slug: `art-${a.slug}`,
    sectionKey: a.category,
    sectionLabel: artSectionLabels[a.category],
    title: a.title,
    venue: a.venue,
    city: a.city,
    country: a.country,
    startDate: a.startDate,
    endDate: a.endDate,
    description: a.description,
    sourceUrl: a.sourceUrl,
    sourceLabel: a.sourceLabel,
    heroImage: a.heroImage,
  };
}

function fromWorldEvent(e: WorldEvent): CalendarEntry {
  return {
    slug: `event-${e.slug}`,
    sectionKey: e.category,
    sectionLabel: eventCategoryLabels[e.category],
    title: e.title,
    venue: `${e.organizer} · ${e.venue}`,
    city: e.city,
    country: e.country,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
    sourceUrl: e.sourceUrl,
    sourceLabel: e.sourceLabel,
    heroImage: e.heroImage,
  };
}

export const calendarSectionOrder: { key: string; label: string }[] = [
  { key: "gallery", label: artSectionLabels.gallery },
  { key: "museum", label: artSectionLabels.museum },
  { key: "fair", label: artSectionLabels.fair },
  { key: "convention", label: eventCategoryLabels.convention },
  { key: "professional", label: eventCategoryLabels.professional },
  { key: "sporting", label: eventCategoryLabels.sporting },
  { key: "music-festival", label: eventCategoryLabels["music-festival"] },
  { key: "food-wine", label: eventCategoryLabels["food-wine"] },
  { key: "tech", label: eventCategoryLabels.tech },
  { key: "film", label: eventCategoryLabels.film },
  { key: "design", label: eventCategoryLabels.design },
  { key: "fashion", label: eventCategoryLabels.fashion },
];

export function buildCalendarEntries(): CalendarEntry[] {
  return [...artListings.map(fromArtListing), ...worldEvents.map(fromWorldEvent)];
}
