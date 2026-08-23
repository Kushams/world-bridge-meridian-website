import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { stays } from "@/data/stays";
import { getDestination } from "@/data/destinations";
import { themeImage } from "@/data/images";

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
        description="A sample of the accommodation we recommend as part of a journey — vetted for character and service, not simply availability."
        image={themeImage("stays", 0)}
        imageAlt="A minimalist bedroom interior"
      />
      <section className="py-16 md:py-24">
        <Container>
          {categories.map((category) => {
            const items = stays.filter((s) => s.category === category);
            return (
              <div key={category} className="mb-16 last:mb-0">
                <p className="eyebrow mb-6">{category}</p>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                </div>
              </div>
            );
          })}
        </Container>
      </section>
    </>
  );
}
