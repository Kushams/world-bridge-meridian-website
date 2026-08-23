import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { destinations, getDestination } from "@/data/destinations";
import { packages } from "@/data/packages";
import { experiences } from "@/data/experiences";
import { staysForDestination } from "@/data/stays";
import { travelStyleLabel } from "@/data/travel-styles";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { GalleryStrip } from "@/components/detail/GalleryStrip";
import { ItineraryTimeline } from "@/components/detail/ItineraryTimeline";
import { PricingBlock } from "@/components/detail/PricingBlock";
import { PackageCard } from "@/components/cards/PackageCard";
import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { reviewsForDestinationSlug } from "@/data/reviews";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return {};
  return {
    title: `${destination.name} Travel & Journeys`,
    description: destination.shortDescription,
    openGraph: { images: [destination.heroImage] },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();

  const relatedPackages = packages.filter((p) => p.destinationSlugs.includes(slug));
  const relatedExperiences = experiences.filter((e) => e.destinationSlug === slug);
  const relatedStays = staysForDestination(slug);
  const relatedReviews = reviewsForDestinationSlug(slug, destination.name);

  return (
    <>
      <PageHero
        eyebrow={`${destination.country} · ${destination.region}`}
        title={destination.name}
        description={destination.shortDescription}
        image={destination.heroImage}
        imageAlt={`${destination.name}, ${destination.country}`}
      />

      <Container className="py-8">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: "Destinations", href: "/destinations" },
            { label: destination.name },
          ]}
        />
      </Container>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <SectionHeading eyebrow="Why" title={`Why ${destination.name}`} />
              <div className="mt-6 space-y-4">
                {destination.description.map((p, i) => (
                  <p key={i} className="text-base text-stone leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {destination.travelStyles.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-line px-4 py-1.5 text-xs uppercase tracking-wide text-ivory-dim"
                  >
                    {travelStyleLabel(style)}
                  </span>
                ))}
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-4">Things To Do &amp; Adventures</p>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {destination.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-4">Best Travel Periods</p>
                <p className="text-sm text-stone">{destination.bestTravelPeriods.join(" · ")}</p>
              </div>
            </div>

            <div className="space-y-6">
              <PricingBlock
                tiers={destination.indicativePricing}
                ctaLabel="Plan This Journey"
                saveItem={{
                  type: "destination",
                  slug: destination.slug,
                  title: destination.name,
                  image: destination.heroImage,
                  href: `/destinations/${destination.slug}`,
                }}
              />
              {destination.cruiseAvailable ? (
                <div className="rounded-card border hairline p-6">
                  <p className="font-display text-lg text-ivory">Cruise Options</p>
                  <p className="mt-2 text-sm text-stone leading-relaxed">
                    {destination.name} is also reachable by cruise as part of several of our
                    itineraries.
                  </p>
                  <div className="mt-4">
                    <Button href="/cruises" variant="outline" size="md">
                      View Cruise Options
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-16">
            <p className="eyebrow mb-4">{destination.name} in Pictures</p>
            <GalleryStrip images={destination.gallery} alt={destination.name} />
          </div>

          {relatedPackages.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Featured Journeys" title="Journeys in this destination" />
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPackages.map((pkg) => (
                  <PackageCard key={pkg.slug} pkg={pkg} />
                ))}
              </div>
            </div>
          ) : null}

          {relatedExperiences.length > 0 ? (
            <div className="mt-20">
              <SectionHeading eyebrow="Experiences" title={`Curated in ${destination.name}`} />
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                {relatedExperiences.map((exp) => (
                  <ExperienceCard key={exp.slug} experience={exp} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Hotels & Stays" title="Where you might stay" />
              <ul className="mt-6 space-y-4">
                {(relatedStays.length
                  ? relatedStays.map((s) => s.name)
                  : destination.recommendedStays
                ).map((name, i) => (
                  <li key={i} className="border-t hairline pt-4 text-sm text-stone">
                    {name}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button href="/stays" variant="outline">
                  Browse Stays
                </Button>
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Sample Itinerary" title="How the days might unfold" />
              <div className="mt-6">
                <ItineraryTimeline days={destination.sampleItinerary} />
              </div>
            </div>
          </div>

          {relatedReviews.length > 0 ? (
            <div className="mt-20">
              <SectionHeading
                eyebrow="Client Reviews"
                title={`What Clients Say About ${destination.name}`}
              />
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              <div className="mt-8">
                <Button href="/reviews" variant="outline">
                  Read All Reviews
                </Button>
              </div>
            </div>
          ) : null}

          <div className="mt-24 rounded-card border hairline bg-charcoal p-10 text-center md:p-16">
            <h2 className="font-display text-3xl md:text-4xl text-ivory">
              Plan Your {destination.name} Journey
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone">
              Tell us your dates, who&apos;s traveling, and the kind of experience you&apos;re
              after — we&apos;ll take it from there.
            </p>
            <div className="mt-8">
              <Button href="/plan-your-journey" size="lg">
                Plan Your Journey
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
