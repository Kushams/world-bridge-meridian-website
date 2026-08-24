import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "How World Bridge Meridian designs a journey, from the first conversation through to the trip itself — discover, consult, design, coordinate, review, finalize, travel, support.",
};

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "We start by understanding what you actually want to experience — not just where.",
  },
  {
    number: "02",
    title: "Consult",
    description: "A real conversation about destination, interests, timing, preferences and expectations.",
  },
  {
    number: "03",
    title: "Design",
    description: "We develop the journey itself — route, pacing, accommodation style and experiences.",
  },
  {
    number: "04",
    title: "Coordinate",
    description: "We work across the relevant travel, hospitality and experience network to bring it together.",
  },
  {
    number: "05",
    title: "Review",
    description: "You review the proposed journey and tell us what to adjust.",
  },
  {
    number: "06",
    title: "Finalize",
    description: "We refine the details until the itinerary is exactly right.",
  },
  {
    number: "07",
    title: "Travel",
    description: "You experience the journey, designed around you rather than assembled from what was available.",
  },
  {
    number: "08",
    title: "Support",
    description: "We remain available as appropriate throughout the journey, from the same team that designed it.",
  },
];

export default function HowWeWorkPage() {
  return (
    <>
      <PageHero
        eyebrow="How We Work"
        title="One journey. One point of contact. Every detail considered."
        description="World Bridge Meridian coordinates a journey from first conversation through the trip itself — not a series of separate bookings handed between departments."
        image={themeImage("business", 2)}
        imageAlt="A small group working together at a table"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="border-t hairline pt-6">
                <p className="font-display text-3xl text-gold">{step.number}</p>
                <h2 className="mt-3 font-display text-lg text-ivory">{step.title}</h2>
                <p className="mt-2 text-sm text-stone leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t hairline bg-charcoal py-20 md:py-28">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Ready to start the conversation?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us what you&apos;re imagining and we&apos;ll take it from there.
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
