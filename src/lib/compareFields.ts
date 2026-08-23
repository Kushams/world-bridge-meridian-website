import { SavedItem } from "./savedItems";
import { getPackage } from "@/data/packages";
import { getJourneyStory } from "@/data/journey-stories";
import { getDestination } from "@/data/destinations";
import { getCruise } from "@/data/cruises";
import { formatPrice } from "@/lib/format";
import { travelStyleLabel } from "@/data/travel-styles";

export interface CompareRow {
  item: SavedItem;
  typeLabel: string;
  duration: string;
  travelStyles: string;
  travelerType: string;
  investment: string;
  season: string;
  cruiseAvailable: string;
}

const typeLabels: Record<SavedItem["type"], string> = {
  destination: "Destination",
  package: "Travel Package",
  cruise: "Cruise",
  "journey-story": "Journey Story",
};

export function getCompareRow(item: SavedItem): CompareRow {
  const base = { item, typeLabel: typeLabels[item.type] };

  if (item.type === "package") {
    const pkg = getPackage(item.slug);
    return {
      ...base,
      duration: pkg?.duration ?? "—",
      travelStyles: pkg?.travelStyles.map(travelStyleLabel).join(", ") ?? "—",
      travelerType: pkg?.travelerType ?? "—",
      investment: pkg ? formatPrice(pkg.indicativePricing[0]) : "—",
      season: "—",
      cruiseAvailable: "—",
    };
  }

  if (item.type === "journey-story") {
    const story = getJourneyStory(item.slug);
    return {
      ...base,
      duration: story?.duration ?? "—",
      travelStyles: story?.travelStyles.map(travelStyleLabel).join(", ") ?? "—",
      travelerType: story?.travelerType ?? "—",
      investment: story ? formatPrice(story.indicativePricing[0]) : "—",
      season: "—",
      cruiseAvailable: "—",
    };
  }

  if (item.type === "cruise") {
    const cruise = getCruise(item.slug);
    return {
      ...base,
      duration: cruise?.duration ?? "—",
      travelStyles: cruise?.category ?? "—",
      travelerType: "—",
      investment: cruise ? formatPrice(cruise.indicativePricing[0]) : "—",
      season: cruise?.travelPeriod ?? "—",
      cruiseAvailable: "Yes",
    };
  }

  const destination = getDestination(item.slug);
  return {
    ...base,
    duration: "—",
    travelStyles: destination?.travelStyles.map(travelStyleLabel).join(", ") ?? "—",
    travelerType: "—",
    investment: destination ? formatPrice(destination.indicativePricing[0]) : "—",
    season: destination?.bestTravelPeriods.join(", ") ?? "—",
    cruiseAvailable: destination?.cruiseAvailable ? "Yes" : "No",
  };
}
