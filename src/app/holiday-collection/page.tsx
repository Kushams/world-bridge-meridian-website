import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Holiday Collection",
  description:
    "Festive-season journey concepts — from Christmas markets in Europe to New Year in New York, holiday cruises and warm-weather escapes — designed around your holidays, not a fixed package.",
};

const concepts = [
  {
    title: "Festive Europe",
    description: "Christmas markets, mulled wine and old-town squares strung with lights across the continent.",
    image: themeImage("cityscape", 10),
  },
  {
    title: "New York Holiday Season",
    description: "Ice skating, department-store windows and the energy of Manhattan at its most festive.",
    image: themeImage("cityscape", 6),
  },
  {
    title: "London at Christmas",
    description: "West End lights, winter markets and a proper English Christmas in the city.",
    image: themeImage("cityscape", 2),
  },
  {
    title: "Paris in Winter",
    description: "Quieter streets, café windows fogged with warmth, and the city dressed for the season.",
    image: themeImage("cityscape", 1),
  },
  {
    title: "Italy During the Festive Season",
    description: "Midnight mass in Rome, Christmas markets in the north, and a slower southern Italian Christmas.",
    image: themeImage("culturalHeritage", 0),
  },
  {
    title: "Dubai Holiday Escapes",
    description: "Winter sun, desert adventures and a skyline that puts on its own kind of festive show.",
    image: themeImage("cityscape", 4),
  },
  {
    title: "Caribbean Escapes",
    description: "Warm-weather holidays for travelers who'd rather trade the cold for a beach.",
    image: themeImage("tropicalBeach", 0),
  },
  {
    title: "Holiday Cruises",
    description: "A ship decorated for the season, a new port every few days, and nothing to plan once you're aboard.",
    image: themeImage("cruiseAndSea", 0),
  },
  {
    title: "Family Holiday Journeys",
    description: "Built around the whole family's pace — multi-generational trips that actually work for everyone.",
    image: themeImage("peopleTravel", 1),
  },
  {
    title: "Couples' Holiday Escapes",
    description: "A quieter, warmer or simply different holiday for two, away from the usual routine.",
    image: themeImage("peopleTravel", 0),
  },
  {
    title: "Luxury Holiday Journeys",
    description: "Understated luxury for the season — fine hotels and private arrangements at every step.",
    image: themeImage("luxuryResort", 0),
  },
  {
    title: "New Year Journeys",
    description: "See the new year in somewhere that actually feels like a departure from the everyday.",
    image: themeImage("cityscape", 6),
  },
];

export default function HolidayCollectionPage() {
  return (
    <>
      <PageHero
        eyebrow="Holiday Collection"
        title="The holidays, designed around you."
        description="Festive-season journey concepts across Europe, the Americas and beyond — built around when you're free to travel, not a fixed departure date."
        image={themeImage("cityscape", 6)}
        imageAlt="A city decorated for the winter holiday season at night"
      />

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Illustrative Concepts"
            title="A starting point for the season."
            description={`${company.sampleDataDisclaimer} Every holiday journey is designed from a private consultation — these are the kinds of journeys we're most often asked to build around the season.`}
          />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <div className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                      className="img-zoom object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-display text-lg text-ivory">{c.title}</h3>
                    <p className="mt-2 text-sm text-stone leading-relaxed">{c.description}</p>
                    <Link
                      href="/plan-your-journey"
                      className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors"
                    >
                      Design My Holiday Journey →
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t hairline bg-charcoal py-20 md:py-28">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Tell us what your holidays should look like this year.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone leading-relaxed">
            Every enquiry is handled directly by the World Bridge Meridian team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/plan-your-journey" size="lg">
              Design My Holiday Journey
            </Button>
            <Button href="/travel-packages" variant="outline" size="lg">
              Explore the Collection
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
