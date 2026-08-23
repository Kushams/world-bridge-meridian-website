import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Corporate Travel",
  description:
    "Executive travel, corporate retreats, conferences and incentive journeys organized by World Bridge Meridian.",
};

export default function CorporateTravelPage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Executive travel, organized properly."
      intro="Conferences, retreats, incentive trips and VIP travel — coordinated with the same attention to detail as any of our private journeys."
      heroImage={themeImage("business", 2)}
      heroImageAlt="A small group working together"
      travelStyle="business"
      examples={[
        "Executive travel",
        "Corporate retreats",
        "Conferences",
        "Meetings",
        "Incentive travel",
        "VIP travel",
        "Corporate groups",
        "Multi-city journeys",
        "Events",
      ]}
      ctaLabel="Start a Corporate Enquiry"
    />
  );
}
