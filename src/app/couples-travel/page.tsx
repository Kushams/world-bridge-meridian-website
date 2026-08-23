import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Couples Travel",
  description:
    "Romantic escapes, honeymoons and anniversary journeys organized by World Bridge Meridian, designed for two.",
};

export default function CouplesTravelPage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Journeys designed for two."
      intro="Honeymoons, anniversaries and romantic escapes — arranged around the pace and privacy that make a couples' journey feel considered."
      heroImage={themeImage("peopleTravel", 0)}
      heroImageAlt="A couple silhouetted at sunset"
      travelStyle="romance"
      examples={[
        "Romantic escapes",
        "Honeymoons",
        "Anniversaries",
        "Luxury couples journeys",
        "Beach escapes",
        "City breaks",
        "Private experiences",
      ]}
      ctaLabel="Plan a Couples Journey"
    />
  );
}
