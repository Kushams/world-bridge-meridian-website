import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { JournalExplorer } from "@/components/journal/JournalExplorer";
import { journal } from "@/data/journal";
import { unsplashPhoto } from "@/data/images";

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
        image={unsplashPhoto("1748016276313-7f9b25de7376")}
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
