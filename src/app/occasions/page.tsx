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
  title: "Journeys for Life's Moments",
  description:
    "Travel built around the occasion, not just the destination — honeymoons, anniversaries, proposals, family reunions, graduations and milestone celebrations.",
};

const occasions = [
  {
    title: "Honeymoon in Italy",
    occasion: "Honeymoons",
    description: "Rome, Florence and Venice, or a slower single-region stay — paced for two, not a tour group.",
    image: themeImage("culturalHeritage", 0),
  },
  {
    title: "Anniversary in Paris",
    occasion: "Anniversaries",
    description: "A return to where it began, or somewhere entirely new to mark the years since.",
    image: themeImage("cityscape", 1),
  },
  {
    title: "A Proposal, Planned Properly",
    occasion: "Proposals",
    description: "The setting matters. We help find and arrange the moment, privately and without a hitch.",
    image: themeImage("coastal", 0),
  },
  {
    title: "Family Celebration in Barcelona",
    occasion: "Family Reunions",
    description: "Multi-generational trips built around a single milestone — a big birthday, an anniversary, a reunion.",
    image: themeImage("peopleTravel", 5),
  },
  {
    title: "Graduation Journey Through Europe",
    occasion: "Graduations",
    description: "A first serious trip to mark a real milestone, before the next chapter starts.",
    image: themeImage("adventure", 0),
  },
  {
    title: "A Retirement, Marked Properly",
    occasion: "Retirement Celebrations",
    description: "Decades of work deserve more than a long weekend — a journey built around finally having the time.",
    image: themeImage("mountainNature", 1),
  },
  {
    title: "A Milestone Birthday, Somewhere Worth It",
    occasion: "Milestone Celebrations",
    description: "The big-number birthdays deserve a destination that matches the occasion.",
    image: themeImage("luxuryResort", 1),
  },
  {
    title: "A Corporate Retreat in the Mediterranean",
    occasion: "Corporate Retreats",
    description: "Team travel that's actually worth leaving the office for — see also Corporate Travel and Institutional Travel.",
    image: themeImage("business", 2),
  },
];

export default function OccasionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Journeys for Life's Moments"
        title="Some trips are about the occasion, not just the place."
        description="A honeymoon, an anniversary, a reunion, a milestone birthday — the destination matters, but the occasion is what actually shapes the journey. Tell us what you're marking, and we'll build around it."
        image={themeImage("peopleTravel", 2)}
        imageAlt="Friends celebrating together outdoors"
      />

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Illustrative Journeys"
            title="Starting points, not a fixed menu."
            description={`${company.sampleDataDisclaimer} Every journey is designed from a private consultation around your specific occasion.`}
          />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((o, i) => (
              <Reveal key={o.title} delay={i * 60}>
                <div className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                    <Image
                      src={o.image}
                      alt={o.title}
                      fill
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                      className="img-zoom object-cover"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="eyebrow !text-[0.65rem] mb-1">{o.occasion}</p>
                    <h3 className="font-display text-lg text-ivory">{o.title}</h3>
                    <p className="mt-2 text-sm text-stone leading-relaxed">{o.description}</p>
                    <Link
                      href="/plan-your-journey"
                      className="mt-3 inline-block text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors"
                    >
                      Design This Journey →
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
            What are you traveling to mark?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us the occasion and we&apos;ll help shape a journey around it.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Design My Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
