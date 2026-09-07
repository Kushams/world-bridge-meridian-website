import type { Metadata } from "next";
import Link from "next/link";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { Container } from "@/components/ui/Container";
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
      ctaLabel="Request a Group Travel Brief"
      afterHero={
        <section className="border-b hairline py-10">
          <Container>
            <p className="max-w-2xl text-sm text-stone leading-relaxed">
              Planning for a university, museum, association or other formal institution? See how
              we run a full{" "}
              <Link href="/institutional" className="text-gold hover:text-ivory transition-colors">
                Institutional Travel
              </Link>{" "}
              program, including our request-for-proposal process, or discuss a{" "}
              <Link href="/corporate-travel" className="text-gold hover:text-ivory transition-colors">
                Corporate Travel
              </Link>{" "}
              brief.
            </p>
          </Container>
        </section>
      }
    />
  );
}
