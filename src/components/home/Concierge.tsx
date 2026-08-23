import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    number: "01",
    title: "Discover",
    description: "We start by understanding the traveler — who's going, what draws them to a place, and what kind of trip they actually want.",
  },
  {
    number: "02",
    title: "Consult",
    description: "A conversation about destination, interests, timing and expectations — not a form disappearing into a queue.",
  },
  {
    number: "03",
    title: "Design",
    description: "We shape the journey itself: pacing, accommodation style, experiences and the route that connects them.",
  },
  {
    number: "04",
    title: "Coordinate",
    description: "Accommodation, transportation, experiences and partners are brought together into a single, confirmed itinerary.",
  },
  {
    number: "05",
    title: "Travel",
    description: "The journey happens — designed around you, not assembled from whatever was available.",
  },
  {
    number: "06",
    title: "Support",
    description: "Assistance throughout the journey where applicable, from the same team that designed it.",
  },
];

export function Concierge() {
  return (
    <section className="border-y hairline bg-charcoal py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The World Bridge Concierge"
            title="One journey. One point of contact. Every detail considered."
            description="World Bridge Meridian coordinates a journey from first conversation through the trip itself — not a series of separate bookings handed between departments."
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 90}>
              <div className="border-t hairline pt-6">
                <p className="font-display text-3xl text-gold">{step.number}</p>
                <h3 className="mt-3 font-display text-lg text-ivory">{step.title}</h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
