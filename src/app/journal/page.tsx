import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { JournalExplorer } from "@/components/journal/JournalExplorer";
import { journal } from "@/data/journal";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Travel Journal",
  description:
    "Notes on planning a better journey — destinations, travel inspiration, luxury travel, arts & culture, cruises and seasonal guides from World Bridge Meridian.",
};

export default function JournalPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Travel Journal"
        description="Notes on planning a better journey, drawn from the itineraries we build every day."
        image={themeImage("culturalHeritage", 1)}
        imageAlt="A museum exhibit"
      />
      <section className="py-16 md:py-24">
        <Container>
          <JournalExplorer articles={journal} />
        </Container>
      </section>
    </>
  );
}
