import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { PackagesExplorer } from "@/components/packages/PackagesExplorer";
import { packages } from "@/data/packages";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Travel Packages",
  description:
    "Curated travel packages from World Bridge Meridian, spanning family, romance, culture, adventure, luxury, corporate and cruise journeys.",
};

export default function TravelPackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Travel Packages"
        description="Journeys we've shaped before — each one a starting point, not a fixed itinerary. Every detail can be adjusted around you."
        image={themeImage("culturalHeritage", 2)}
        imageAlt="A European old-town square"
      />
      <section className="py-16 md:py-24">
        <Container>
          <PackagesExplorer packages={packages} />
        </Container>
      </section>
    </>
  );
}
