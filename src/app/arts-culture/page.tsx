import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Arts & Culture Travel",
  description:
    "Museums, galleries, opera and heritage — cultural journeys designed by World Bridge Meridian for travelers who want to go deeper into a place.",
};

export default function ArtsCulturePage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Travel through culture."
      intro="Museums, art galleries, opera, performing arts and heritage sites — journeys built for clients who travel to go deeper into a place, not just to see it."
      heroImage={themeImage("culturalHeritage", 8)}
      heroImageAlt="A museum gallery interior"
      travelStyle="arts-culture"
      examples={[
        "Museums",
        "Art galleries",
        "Opera",
        "Performing arts",
        "Art fairs",
        "Exhibitions",
        "Cultural festivals",
        "Architecture",
        "Heritage & historic sites",
        "Artist travel",
        "Collector travel",
        "Institutional travel",
        "University cultural travel",
        "Cultural delegations",
      ]}
      ctaLabel="Plan a Cultural Journey"
    />
  );
}
