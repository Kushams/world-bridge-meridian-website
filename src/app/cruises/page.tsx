import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { CruisesExplorer } from "@/components/cruises/CruisesExplorer";
import { cruises } from "@/data/cruises";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Cruises",
  description:
    "Ocean and river cruise journeys organized by World Bridge Meridian, from the Mediterranean to Alaska, the Baltic and beyond.",
};

export default function CruisesPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Cruises"
        description="Ocean and river journeys across our cruise categories, organized end to end alongside land stays where you want them."
        image={themeImage("cruiseAndSea", 0)}
        imageAlt="Aerial view of tropical water"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-10 max-w-2xl text-sm text-stone-dim">
            {company.sampleDataDisclaimer} Every sailing below is confirmed with our cruise
            partners at the time of enquiry.
          </p>
          <CruisesExplorer cruises={cruises} />
        </Container>
      </section>
    </>
  );
}
