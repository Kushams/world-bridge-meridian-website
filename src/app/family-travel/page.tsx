import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Family Travel",
  description:
    "Family journeys organized by World Bridge Meridian — multi-generational travel, family reunions, cruises and cultural journeys that work for every generation.",
};

export default function FamilyTravelPage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Journeys that work for every generation."
      intro="From toddlers to grandparents, we build in the pacing, accommodation and activities that keep a family trip enjoyable for everyone in it."
      heroImage={themeImage("peopleTravel", 1)}
      heroImageAlt="A parent and child at sunset"
      travelStyle="family"
      examples={[
        "Family holidays",
        "Multi-generational travel",
        "Family reunions",
        "Family cruises",
        "Family cultural journeys",
        "Family beach escapes",
        "Family city experiences",
      ]}
      ctaLabel="Plan a Family Journey"
    />
  );
}
