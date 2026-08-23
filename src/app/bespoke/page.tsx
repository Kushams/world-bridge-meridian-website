import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Bespoke Journeys",
  description:
    "Entirely custom travel, designed around exactly what you have in mind — World Bridge Meridian's bespoke journey planning.",
};

export default function BespokePage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Your journey. Your way."
      intro="When nothing off the shelf fits, we build the itinerary entirely from what you tell us — destinations, pace, style and every detail in between."
      heroImage={themeImage("mountainNature", 1)}
      heroImageAlt="A remote mountain landscape"
      travelStyle="bespoke"
      examples={[
        "Multi-country journeys",
        "Luxury holidays",
        "Honeymoons",
        "Anniversaries",
        "Family journeys",
        "Couples journeys",
        "Cultural travel",
        "Arts travel",
        "Private experiences",
        "Adventure",
        "Wellness",
        "Culinary travel",
        "Corporate journeys",
        "Institutional travel",
        "Special celebrations",
      ]}
      ctaLabel="Design My Journey"
    />
  );
}
