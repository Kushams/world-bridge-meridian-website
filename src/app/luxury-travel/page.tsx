import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Luxury Travel",
  description:
    "Understated luxury travel from World Bridge Meridian — fine hotels, private experiences and premium arrangements at every step.",
};

export default function LuxuryTravelPage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Luxury, quietly done."
      intro="Fine hotels, private experiences and premium arrangements — luxury that shows in the details rather than the volume."
      heroImage={themeImage("luxuryResort", 2)}
      heroImageAlt="An infinity pool at dusk"
      travelStyle="luxury"
      examples={[
        "Luxury hotels",
        "Resorts",
        "Villas",
        "Private experiences",
        "Luxury cruises",
        "Premium transportation",
        "Fine dining",
        "Wellness",
        "VIP arrangements",
      ]}
      ctaLabel="Plan a Luxury Journey"
    />
  );
}
