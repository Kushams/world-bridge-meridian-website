import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Careers",
  description: `Careers at ${company.name} — how our team is structured and how to reach us about joining.`,
};

const departments = [
  {
    name: "Travel Design & Experience",
    description:
      "Turns a client's first conversation into an actual itinerary — destinations, pacing, accommodation style, cruise and group logistics, and the coordinating officers who confirm bookings once a journey is approved.",
  },
  {
    name: "Operations",
    description:
      "Flight and ground logistics, supplier relationships, visa and travel documentation — the work that has to be right every single time, whether or not a client ever sees it directly.",
  },
  {
    name: "Client Experience",
    description:
      "The team a client actually talks to — before, during and after a journey. Enquiries, in-trip support, and making sure nothing falls through between departments.",
  },
  {
    name: "Finance",
    description: "Pricing oversight, supplier payments and client billing, in cryptocurrency, card or bank transfer.",
  },
  {
    name: "Marketing & Partnerships",
    description:
      "The journal, destination content, and evaluating new hospitality and travel partners before they're ever recommended to a client.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build the journeys you'd want to take."
        description={`${company.name} is growing — see our full team structure on the Leadership page. We don't run a public job board, but if one of the areas below sounds like where you'd fit, we'd like to hear from you.`}
        image={themeImage("business", 2)}
        imageAlt="A team working together"
      />

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="Where We're Growing" title="Departments" />
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <div key={d.name} className="rounded-card border hairline p-6">
                <h3 className="font-display text-lg text-ivory">{d.name}</h3>
                <p className="mt-3 text-sm text-stone leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-charcoal border-y hairline">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="How We Work" title="Independent, detail-led, client-focused." />
              <p className="mt-6 text-base text-stone leading-relaxed">
                We&apos;re not tied to a single airline, hotel group or supplier, and that independence
                shapes how we work internally too — every recommendation, every itinerary, every booking
                is made for the traveler, not for a shortcut. It&apos;s detailed, sometimes exacting work,
                for people who care about getting the small things right.
              </p>
            </div>
            <div>
              <SectionHeading eyebrow="How To Reach Us" title="No listings — just a conversation." />
              <p className="mt-6 text-base text-stone leading-relaxed">
                We don&apos;t currently post individual openings. If you think you&apos;d be a fit for one
                of the departments above, get in touch and tell us about yourself and what you&apos;re
                looking for — we review every message that comes in.
              </p>
              <div className="mt-8">
                <Button href="/contact" size="lg">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
