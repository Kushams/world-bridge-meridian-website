import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";

const reasons = [
  {
    title: "Independent",
    description:
      "We're not tied to a single airline, hotel group or supplier — every recommendation is chosen for the journey, not for a partnership incentive.",
  },
  {
    title: "Journeys, Not Transactions",
    description:
      "We coordinate the full arc of a trip — accommodation, transportation, experiences and pacing — rather than selling a single booking.",
  },
  {
    title: "Founded on Relationships",
    description: `Since ${company.foundedYear}, we've built our business on returning clients rather than one-time bookings.`,
  },
  {
    title: "Detail-Oriented",
    description:
      "From restaurant reservations to bush-flight connections, the logistics that make or break a trip are handled before you arrive.",
  },
];

export function WhyWorldBridge() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Why World Bridge Meridian"
            title="We don't just sell travel. We organize journeys."
            description={company.tagline}
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => (
            <Reveal key={reason.title} delay={i * 100}>
              <div className="border-t hairline pt-6">
                <h3 className="font-display text-lg text-ivory">{reason.title}</h3>
                <p className="mt-3 text-sm text-stone leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
