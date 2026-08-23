import type { Metadata } from "next";
import { ArtListingsPage } from "@/components/specialty/ArtListingsPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Museum Exhibitions",
  description:
    "Major current and upcoming museum exhibitions worldwide — and journeys built around seeing them in person.",
};

export default function MuseumsPage() {
  return (
    <ArtListingsPage
      eyebrow="Arts & Culture"
      title="Museum exhibitions worth traveling for."
      intro="Major current and upcoming exhibitions at leading museums around the world — separate from our gallery listings, since a museum retrospective and a commercial gallery show call for a different kind of trip."
      heroImage={themeImage("culturalHeritage", 6)}
      heroImageAlt="A museum gallery interior"
      category="museum"
      ctaLabel="Plan a Museum Trip"
      emptyNote="No museum exhibitions currently listed — check back soon, or tell us what you're hoping to see."
    />
  );
}
