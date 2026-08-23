import type { Metadata } from "next";
import { ArtListingsPage } from "@/components/specialty/ArtListingsPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Gallery Exhibitions",
  description:
    "Current and upcoming exhibitions at leading contemporary art galleries worldwide — and journeys built around seeing them in person.",
};

export default function ExhibitionsPage() {
  return (
    <ArtListingsPage
      eyebrow="Arts & Culture"
      title="Gallery exhibitions worth traveling for."
      intro="A running list of notable exhibitions at leading contemporary galleries around the world — for clients who plan a trip around a specific show, not the other way around."
      heroImage={themeImage("culturalHeritage", 7)}
      heroImageAlt="A contemporary art gallery interior"
      category="gallery"
      ctaLabel="Plan a Gallery Trip"
      emptyNote="No gallery exhibitions currently listed — check back soon, or tell us what you're hoping to see."
    />
  );
}
