import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { currentJourneys } from "@/data/current-journeys";
import { destinations } from "@/data/destinations";
import { themeImage } from "@/data/images";
import { formatPrice } from "@/lib/format";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Current Journeys",
  description:
    "Current and upcoming travel opportunities from World Bridge Meridian — sample and indicative journeys, confirmed at enquiry.",
};

export default function CurrentJourneysPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Current Journeys"
        description="A snapshot of journeys we're actively shaping. None of these represent live, guaranteed availability — every one is confirmed with you at enquiry."
        image={themeImage("cityscape", 6)}
        imageAlt="A city street at dusk"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-10 max-w-2xl rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            {company.sampleDataDisclaimer}
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {currentJourneys.map((journey) => {
              const journeyDestinations = destinations.filter((d) =>
                journey.destinationSlugs.includes(d.slug),
              );
              return (
                <div key={journey.slug} className="group">
                  <Link href="/plan-your-journey" className="block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                      <Image
                        src={journey.heroImage}
                        alt={journey.title}
                        fill
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                        className="img-zoom object-cover"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-ink/70 backdrop-blur px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-ivory">
                        {journey.status}
                      </div>
                    </div>
                  </Link>
                  <div className="mt-4">
                    <p className="eyebrow !text-[0.65rem] mb-1">
                      {journey.travelType} · {journey.duration}
                    </p>
                    <h3 className="font-display text-lg text-ivory">{journey.title}</h3>
                    <p className="mt-1 text-sm text-stone">{journey.travelPeriod}</p>
                    {journeyDestinations.length > 0 ? (
                      <p className="mt-1 text-xs text-stone-dim">
                        {journeyDestinations.map((d) => d.name).join(", ")}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold text-ivory-dim">
                      {formatPrice(journey.indicativePricing)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 rounded-card border hairline bg-charcoal p-10 text-center md:p-16">
            <h2 className="font-display text-3xl md:text-4xl text-ivory">
              Don&apos;t see the journey you&apos;re imagining?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone">
              These are only a sample of what we organize. Tell us what you have in mind and
              we&apos;ll build it from there.
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
