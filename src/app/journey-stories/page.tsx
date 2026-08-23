import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { JourneyStoryCard } from "@/components/cards/JourneyStoryCard";
import { journeyStories } from "@/data/journey-stories";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";

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
          <p className="mb-10 max-w-2xl rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            {company.sampleDataDisclaimer}
          </p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {journeyStories.map((story) => (
              <JourneyStoryCard key={story.slug} story={story} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
