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
  title: "Private Journeys",
  description:
    "Fully private journeys designed around a single traveler, couple, family or group — from a private Mediterranean escape to a private African safari.",
};

const concepts = [
  {
    title: "Private Mediterranean Escape",
    description: "A private villa or yacht-based journey along the Amalfi, French Riviera or Croatian coast, paced around your own schedule.",
    image: themeImage("coastal", 2),
  },
  {
    title: "Private Italian Art Journey",
    description: "Private after-hours access and art-historian guiding across Rome, Florence and Venice, without a group itinerary to work around.",
    image: themeImage("culturalHeritage", 3),
  },
  {
    title: "Private African Safari",
    description: "An exclusive-use safari camp or private vehicle and guide across Southern or East Africa's game reserves.",
    image: themeImage("safari", 1),
  },
  {
    title: "Private Family Celebration",
    description: "A milestone birthday, anniversary or multi-generational reunion, built around a single villa or private property buyout.",
    image: themeImage("peopleTravel", 3),
  },
  {
    title: "Private Yacht Journey",
    description: "A chartered yacht itinerary through the Greek Islands, the Adriatic or the Caribbean, crewed and provisioned to your preferences.",
    image: themeImage("cruiseAndSea", 1),
  },
  {
    title: "Private European Cultural Journey",
    description: "A single private guide and driver across multiple countries, built around opera, architecture, wine or design rather than a fixed route.",
    image: themeImage("culturalHeritage", 0),
  },
];

export default function PrivateJourneysPage() {
  return (
    <>
      <PageHero
        eyebrow="Private Journeys"
        title="Entirely yours, from the first night to the last."
        description="No shared itinerary, no group pace. A private journey is designed around one traveler, couple, family or group, with every arrangement made privately on your behalf."
        image={themeImage("luxuryResort", 1)}
        imageAlt="A private villa terrace overlooking the coast"
      />

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Illustrative Concepts"
            title="A starting point, not a fixed menu."
            description={`${company.sampleDataDisclaimer} Every private journey is designed from a private consultation — these are the kinds of journeys we're most often asked to build.`}
          />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c, i) => (
              <Reveal key={c.title} delay={i * 70}>
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
                      Enquire Privately →
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
            Tell us what a private journey means to you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone leading-relaxed">
            Every enquiry is handled directly and confidentially by the World Bridge Meridian
            team.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Enquire Privately
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
