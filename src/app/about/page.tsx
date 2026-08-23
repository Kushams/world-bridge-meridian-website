import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { team } from "@/data/team";
import { themeImage } from "@/data/images";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${company.name}, an independent global travel company founded in ${company.foundedYear} by ${company.founderName}.`,
};

const values = [
  {
    title: "Independent",
    description:
      "We're not tied to a single airline, hotel group or supplier — every recommendation is made for the journey, not for a partnership incentive.",
  },
  {
    title: "Global",
    description:
      "Our journeys span every continent — city breaks, cruises, safaris, cultural journeys and entirely bespoke itineraries.",
  },
  {
    title: "Experience-Led",
    description:
      "We start with what a client wants to experience, then build the logistics — accommodation, transportation, timing — around that.",
  },
  {
    title: "Client-Focused",
    description: "The relationship continues past the booking — we're the point of contact if anything needs to change.",
  },
  {
    title: "Relationship-Driven",
    description: `Since ${company.foundedYear}, we've built the business on returning clients rather than one-time transactions.`,
  },
  {
    title: "Detail-Oriented",
    description:
      "From restaurant reservations to bush-flight connections, the logistics that make or break a trip are handled before you arrive.",
  },
];

export default function AboutPage() {
  const founder = team.find((t) => t.slug === "earl-anderson");

  return (
    <>
      <PageHero
        eyebrow="About"
        title={company.legalPositioning}
        description={company.tagline}
        image={themeImage("mountainNature", 2)}
        imageAlt="A dramatic natural landscape"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Our Story" title="Why World Bridge Meridian exists" />
              <div className="mt-6 space-y-4 text-base text-stone leading-relaxed">
                <p>
                  {company.name} was founded in {company.foundedYear} by {company.founderName}{" "}
                  with a simple belief: travel should be more than getting from one place to
                  another. It should be about how you experience the destination — the people you
                  meet, the places you discover, the culture you encounter, the moments you
                  remember.
                </p>
                <p>
                  We bring together destinations, carefully considered accommodations, travel
                  partners, experiences, transportation, cruises and itinerary planning to create
                  journeys around the individual traveler — not a standardized package.
                </p>
                <p>
                  Whether a client wants a family holiday, a romantic escape, a cultural journey,
                  a luxury retreat, a group departure, a cruise, a corporate trip, an
                  institutional journey or something entirely bespoke, we organize the journey
                  around them.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/leadership"
                  className="text-sm font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors"
                >
                  Meet Our Leadership →
                </Link>
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Why World Bridge Meridian" title="We don't just sell travel." />
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {values.map((v) => (
                  <div key={v.title} className="border-t hairline pt-4">
                    <h3 className="font-display text-base text-ivory">{v.title}</h3>
                    <p className="mt-2 text-sm text-stone leading-relaxed">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {founder ? (
            <div className="mt-24 grid grid-cols-1 gap-8 rounded-card border hairline bg-charcoal p-8 sm:grid-cols-[auto_1fr] md:p-12">
              {founder.photo ? (
                <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full sm:h-32 sm:w-32">
                  <Image
                    src={founder.photo}
                    alt={founder.name ?? founder.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div>
                <p className="eyebrow mb-4">{founder.title}</p>
                <h2 className="font-display text-2xl md:text-3xl text-ivory">{founder.name}</h2>
                <div className="mt-6 max-w-2xl space-y-4 text-stone leading-relaxed">
                  {founder.bio?.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-16 text-center">
            <Button href="/plan-your-journey" size="lg">
              Plan Your Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
