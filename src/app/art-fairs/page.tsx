import type { Metadata } from "next";
import { ArtListingsPage } from "@/components/specialty/ArtListingsPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Art Fairs",
  description:
    "Major international art fairs worldwide — and journeys built around attending them.",
};

export default function ArtFairsPage() {
  return (
    <ArtListingsPage
      eyebrow="Arts & Culture"
      title="Art fairs worth traveling for."
      intro="The major international art fairs — the handful of weeks a year when a city's gallery scene, collectors and artists all converge at once."
      heroImage={themeImage("culturalHeritage", 12)}
      heroImageAlt="A busy art fair hall"
      category="fair"
      ctaLabel="Plan an Art Fair Trip"
      emptyNote="No art fairs currently listed — check back soon, or tell us which fair you're hoping to attend."
    />
  );
}
