import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { journeyStories, getJourneyStory } from "@/data/journey-stories";
import { destinations } from "@/data/destinations";
import { travelStyleLabel } from "@/data/travel-styles";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryStrip } from "@/components/detail/GalleryStrip";
import { ItineraryTimeline } from "@/components/detail/ItineraryTimeline";
import { JourneyRoute } from "@/components/detail/JourneyRoute";
import { PricingBlock } from "@/components/detail/PricingBlock";
import { DestinationCard } from "@/components/cards/DestinationCard";

export function generateStaticParams() {
  return journeyStories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = getJourneyStory(slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.overview[0],
    openGraph: { images: [story.heroImage] },
  };
}

export default async function JourneyStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = getJourneyStory(slug);
  if (!story) notFound();

  const relatedDestinations = destinations.filter((d) => story.destinationSlugs.includes(d.slug));

  return (
    <>
      <PageHero
        eyebrow={`${story.subtitle} · ${story.duration}`}
        title={story.title}
        description={story.overview[0]}
        image={story.heroImage}
        imageAlt={story.title}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Journey Stories", href: "/journey-stories" },
            { label: story.title },
          ]}
        />
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SectionHeading eyebrow="The Journey" title="What this journey is" />
              <div className="mt-6 space-y-4">
                {story.overview.map((p, i) => (
                  <p key={i} className="text-base text-stone leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {story.travelStyles.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-wide text-ivory-dim"
                  >
                    {travelStyleLabel(style)}
                  </span>
                ))}
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-3">Why This Journey</p>
                <p className="text-sm text-stone leading-relaxed">{story.whyThisJourney}</p>
              </div>

              <div className="mt-12">
                <p className="eyebrow mb-6">The Route</p>
                <JourneyRoute stops={story.route} />
              </div>

              <div className="mt-12">
                <p className="eyebrow mb-6">Suggested Itinerary</p>
                <ItineraryTimeline days={story.itinerary} />
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-3">Experiences</p>
                  <ul className="space-y-2 text-sm text-stone">
                    {story.experiences.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gold">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow mb-3">Cultural Highlights</p>
                  <ul className="space-y-2 text-sm text-stone">
                    {story.culturalHighlights.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-gold">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-2">Accommodation Style</p>
                <p className="text-sm text-stone leading-relaxed">{story.accommodationStyle}</p>
              </div>

              <div className="mt-16">
                <p className="eyebrow mb-4">Gallery</p>
                <GalleryStrip images={story.gallery} alt={story.title} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="lg:sticky lg:top-28 space-y-6">
                <PricingBlock
                  tiers={story.indicativePricing}
                  ctaLabel="Design This Journey For Me"
                  saveItem={{
                    type: "journey-story",
                    slug: story.slug,
                    title: story.title,
                    image: story.heroImage,
                    href: `/journey-stories/${story.slug}`,
                  }}
                />
              </div>
            </div>
          </div>

          {relatedDestinations.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Where This Journey Takes You" title="The destinations" />
              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {relatedDestinations.map((d) => (
                  <DestinationCard key={d.slug} destination={d} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
