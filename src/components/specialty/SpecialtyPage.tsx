import type { ReactNode } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PackageCard } from "@/components/cards/PackageCard";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { packages } from "@/data/packages";
import { destinations } from "@/data/destinations";
import { reviews } from "@/data/reviews";
import { TravelStyleSlug } from "@/data/types";

export function SpecialtyPage({
  eyebrow,
  title,
  intro,
  heroImage,
  heroImageAlt,
  travelStyle,
  examples,
  examplesLabel = "This includes",
  ctaLabel,
  ctaHref = "/plan-your-journey",
  afterHero,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
  travelStyle: TravelStyleSlug;
  examples: string[];
  examplesLabel?: string;
  ctaLabel: string;
  ctaHref?: string;
  afterHero?: ReactNode;
}) {
  const relatedPackages = packages.filter((p) => p.travelStyles.includes(travelStyle)).slice(0, 3);
  const relatedDestinations = destinations
    .filter((d) => d.travelStyles.includes(travelStyle))
    .slice(0, 8);
  const relatedReviews = reviews.filter((r) => r.tripType === travelStyle).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={intro} image={heroImage} imageAlt={heroImageAlt} />

      {afterHero}

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow={examplesLabel} title="What this can include" />
          <div className="mt-8 flex flex-wrap gap-3">
            {examples.map((e) => (
              <span
                key={e}
                className="rounded-full border border-line px-5 py-2.5 text-sm text-ivory-dim"
              >
                {e}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {relatedPackages.length > 0 ? (
        <section className="py-16 md:py-24 bg-charcoal border-y hairline">
          <Container>
            <SectionHeading eyebrow="Featured Journeys" title="A few examples we've shaped" />
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {relatedDestinations.length > 0 ? (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeading eyebrow="Destinations" title="Where this travels well" />
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {relatedDestinations.map((d) => (
                <DestinationCard key={d.slug} destination={d} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {relatedReviews.length > 0 ? (
        <section className="py-16 md:py-24 bg-charcoal border-y hairline">
          <Container>
            <SectionHeading eyebrow="Reviews" title="What clients have said" />
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-20 md:py-28">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            {title}
          </h2>
          <div className="mt-8">
            <Button href={ctaHref} size="lg">
              {ctaLabel}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
