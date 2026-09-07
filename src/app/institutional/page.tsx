import type { Metadata } from "next";
import Link from "next/link";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Institutional Travel",
  description:
    "Travel coordination for universities, museums, galleries, alumni associations, professional bodies and cultural institutions, organized by World Bridge Meridian.",
};

const audiences = [
  "Universities and academic departments",
  "Museums and galleries",
  "Alumni associations",
  "Professional and trade associations",
  "Cultural and heritage institutions",
  "Schools and educational trusts",
  "Special-interest societies",
];

const coordination = [
  {
    title: "Group sizes",
    description: "From a department of 12 to a multi-cohort program of 150 or more.",
  },
  {
    title: "Planning timeline",
    description: "Typically 4–9 months out for a full program; shorter for a smaller delegation.",
  },
  {
    title: "Transportation coordination",
    description: "Group flights, charters, coaches and transfers scheduled as one plan, not separate bookings.",
  },
  {
    title: "Accommodation coordination",
    description: "Room blocks, rooming lists and accessibility needs managed centrally.",
  },
  {
    title: "Participant management",
    description: "Registration, waivers, dietary and accessibility requirements tracked per traveler.",
  },
  {
    title: "Cultural programming",
    description: "Museum access, curator-led sessions and site visits built around your group's focus.",
  },
  {
    title: "Itinerary development",
    description: "A day-by-day program balancing structured programming with free time.",
  },
  {
    title: "Communication",
    description: "One point of contact for your organization throughout planning and travel.",
  },
];

const rfpSteps = [
  { step: "1", title: "Submit a brief", description: "Tell us the group, purpose, rough dates and scale." },
  { step: "2", title: "Scoping call", description: "We talk through requirements, constraints and approvals needed." },
  { step: "3", title: "Proposal", description: "A written proposal — program outline, logistics and indicative investment." },
  { step: "4", title: "Refinement", description: "We adjust the proposal against your organization's feedback." },
  { step: "5", title: "Confirmation", description: "Once approved, we move to booking and detailed logistics." },
  { step: "6", title: "Delivery", description: "On-the-ground coordination and support throughout the program." },
];

export default function InstitutionalPage() {
  return (
    <>
      <SpecialtyPage
        eyebrow="Our Expertise"
        title="Travel programs for institutions, not just individuals."
        intro="Universities, museums, galleries, alumni associations and professional bodies bring different requirements than a private trip — approvals, cohort sizes, accessibility needs and institutional budgets among them. We coordinate the full program: accommodation, transportation, experiences and on-the-ground logistics, reporting to one point of contact within your organization."
        heroImage={themeImage("culturalHeritage", 2)}
        heroImageAlt="A guided group inside a museum gallery"
        travelStyle="business"
        examples={[
          "Alumni study tours",
          "Museum patron trips",
          "Academic delegations",
          "Professional association conferences",
          "Cultural institution partnerships",
          "Donor and fundraising trips",
          "Multi-department programs",
        ]}
        ctaLabel="Request a Group Travel Brief"
        afterHero={
          <section className="py-16 md:py-20 border-b hairline">
            <Container>
              <SectionHeading eyebrow="Who We Work With" title="Built for organizations, not just travelers." />
              <div className="mt-8 flex flex-wrap gap-3">
                {audiences.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-line px-5 py-2.5 text-sm text-ivory-dim"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-8 max-w-2xl text-sm text-stone leading-relaxed">
                Looking for something more informal — friends, families or a corporate team? See{" "}
                <Link href="/group-travel" className="text-gold hover:text-ivory transition-colors">
                  Group Travel
                </Link>{" "}
                or{" "}
                <Link href="/corporate-travel" className="text-gold hover:text-ivory transition-colors">
                  Corporate Travel
                </Link>
                .
              </p>
            </Container>
          </section>
        }
      />

      <section className="py-16 md:py-24 border-b hairline">
        <Container>
          <SectionHeading eyebrow="What We Coordinate" title="One program, coordinated end to end." />
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {coordination.map((item) => (
              <div key={item.title} className="border-t hairline pt-5">
                <h3 className="font-display text-lg text-ivory">{item.title}</h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-charcoal border-b hairline">
        <Container>
          <SectionHeading
            eyebrow="Request-for-Proposal Process"
            title="How a Group Travel Brief becomes a confirmed program."
          />
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {rfpSteps.map((s) => (
              <div key={s.step}>
                <p className="font-display text-3xl text-gold">{s.step}</p>
                <h3 className="mt-3 font-display text-lg text-ivory">{s.title}</h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
