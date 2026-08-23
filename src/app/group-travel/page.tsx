import type { Metadata } from "next";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Group Travel",
  description:
    "Group travel coordination from World Bridge Meridian — friends, corporate groups, schools, universities, cultural delegations and institutions.",
};

export default function GroupTravelPage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Coordinated, end to end."
      intro="Family groups, friends, corporate teams, schools, universities and cultural delegations — we coordinate itineraries, accommodation, transportation and activities as one journey, not a stack of individual bookings."
      heroImage={themeImage("peopleTravel", 2)}
      heroImageAlt="Friends celebrating together outdoors"
      travelStyle="bespoke"
      examples={[
        "Family groups",
        "Friends",
        "Corporate groups",
        "Schools",
        "Universities",
        "Cultural delegations",
        "Institutions",
        "Events",
        "Retreats",
        "Group cruises",
      ]}
      ctaLabel="Start a Group Travel Enquiry"
    />
  );
}
