import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { JourneyStoryCard } from "@/components/cards/JourneyStoryCard";
import { journeyStories } from "@/data/journey-stories";
import { themeImage } from "@/data/images";
import { SwipeRow } from "@/components/ui/SwipeRow";

export const metadata: Metadata = {
  title: "Journey Stories",
  description:
    "Editorial journeys we've designed — the thinking behind them, the route, and what makes each one worth taking, from World Bridge Meridian.",
};

export default function JourneyStoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Journey Stories"
        title="Journeys, told properly."
        description="Not a catalog listing — the reasoning behind a route, the pace we chose and why, and what the journey actually feels like."
        image={themeImage("culturalHeritage", 4)}
        imageAlt="A traveler walking through a European piazza"
      />

      <section className="py-16 md:py-24">
        <Container>
          <SwipeRow className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-3">
            {journeyStories.map((story) => (
              <JourneyStoryCard key={story.slug} story={story} />
            ))}
          </SwipeRow>
        </Container>
      </section>
    </>
  );
}
