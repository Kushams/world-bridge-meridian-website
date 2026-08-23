import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { DestinationsExplorer } from "@/components/destinations/DestinationsExplorer";
import { destinations } from "@/data/destinations";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse World Bridge Meridian's curated destinations across North America, Europe, the Middle East & Africa, Asia-Pacific and the Indian Ocean.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Destinations"
        description="A starting set of the places we organize journeys to most often — this list grows as new journeys are shaped."
        image={themeImage("cityscape", 1)}
        imageAlt="A city skyline at dusk"
      />
      <section className="py-16 md:py-24">
        <Container>
          <DestinationsExplorer destinations={destinations} />
        </Container>
      </section>
    </>
  );
}
