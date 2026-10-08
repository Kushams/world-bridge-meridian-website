import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { stays } from "@/data/stays";
import { notableStays, stayContinents } from "@/data/topStays";
import { getDestination } from "@/data/destinations";
import { themeImage } from "@/data/images";
import { SwipeRow } from "@/components/ui/SwipeRow";

export const metadata: Metadata = {
  title: "Stays",
  description:
    "Recommended accommodation as part of World Bridge Meridian journeys — luxury hotels, boutique properties, resorts and villas.",
};

const categories = Array.from(new Set(stays.map((s) => s.category)));

export default function StaysPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Stays"
        description="Well-known places to stay across Europe, the Americas, Asia, the Middle East and Oceania, and the kinds of stays we build journeys around."
        image={themeImage("stays", 0)}
        imageAlt="A minimalist bedroom interior"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="eyebrow mb-3">Around the World</p>
          <h2 className="font-display text-3xl text-ivory md:text-4xl text-balance-pretty">
            Top places to stay, around the world.
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-stone leading-relaxed">
            Well-known properties in the destinations we plan journeys to, grouped by continent. They are
            shown as examples of respected places to stay, not as partners: World Bridge Meridian is not
            affiliated with or endorsed by any property named here, and no rate or availability is implied.
            Photography is illustrative. Tell us where you&apos;re going and we&apos;ll shape the right stay
            around your journey.
          </p>
          <div className="chip-row mt-6 flex flex-wrap gap-3">
            {stayContinents.map((continent) => (
              <a
                key={continent}
                href={`#${continent.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wide text-ivory-dim transition-colors hover:border-gold hover:text-gold"
              >
                {continent}
              </a>
            ))}
          </div>

          {stayContinents.map((continent) => {
            const items = notableStays.filter((n) => n.continent === continent);
            return (
              <div
                key={continent}
                id={continent.toLowerCase().replace(/\s+/g, "-")}
                className="mt-12 scroll-mt-24"
              >
                <p className="eyebrow mb-6">{continent}</p>
                <SwipeRow className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((stay) => (
                    <div key={stay.slug}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                        <Image
                          src={stay.heroImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="eyebrow !text-[0.65rem] mb-1">
                          {stay.kind} · {stay.place}
                        </p>
                        <h3 className="font-display text-lg text-ivory">{stay.name}</h3>
                        <p className="mt-2 text-sm text-stone leading-relaxed">{stay.description}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                          {stay.destinationSlug ? (
                            <Link
                              href={`/destinations/${stay.destinationSlug}`}
                              className="text-gold hover:text-ivory transition-colors"
                            >
                              View Destination
                            </Link>
                          ) : null}
                          <Link
                            href={`/plan-your-journey?${new URLSearchParams({
                              destination: stay.place,
                              notes: `Interested in staying at ${stay.name}.`,
                            }).toString()}`}
                            className="text-ivory-dim hover:text-gold transition-colors"
                          >
                            Include This Stay
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </SwipeRow>
              </div>
            );
          })}
        </Container>
      </section>

      <section className="border-t hairline py-16 md:py-24">
        <Container>
          <p className="eyebrow mb-3">Stay Styles</p>
          <h2 className="mb-10 font-display text-3xl text-ivory md:text-4xl text-balance-pretty">
            The kinds of stays we build around.
          </h2>
          {categories.map((category) => {
            const items = stays.filter((s) => s.category === category);
            return (
              <div key={category} className="mb-16 last:mb-0">
                <p className="eyebrow mb-6">{category}</p>
                <SwipeRow className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((stay) => {
                    const destination = getDestination(stay.destinationSlug);
                    return (
                      <div key={stay.slug}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                          <Image
                            src={stay.heroImage}
                            alt={stay.name}
                            fill
                            sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-4">
                          {destination ? (
                            <p className="eyebrow !text-[0.65rem] mb-1">{destination.name}</p>
                          ) : null}
                          <h3 className="font-display text-lg text-ivory">{stay.name}</h3>
                          <p className="mt-2 text-sm text-stone leading-relaxed">
                            {stay.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3 text-xs">
                            {destination ? (
                              <Link
                                href={`/destinations/${destination.slug}`}
                                className="text-gold hover:text-ivory transition-colors"
                              >
                                View Destination
                              </Link>
                            ) : null}
                            <Link
                              href="/plan-your-journey"
                              className="text-ivory-dim hover:text-gold transition-colors"
                            >
                              Include This Stay
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </SwipeRow>
              </div>
            );
          })}
        </Container>
      </section>
    </>
  );
}
