import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const principles = [
  {
    title: "Location",
    description: "We consider not simply where you stay, but where you are within the destination.",
  },
  {
    title: "Pace",
    description: "A great itinerary should have room to breathe — not a checklist run at full speed.",
  },
  {
    title: "Experience",
    description: "We prioritize meaningful experiences over ticking off sights for their own sake.",
  },
  {
    title: "Detail",
    description: "Transfers, timing, reservations and logistics matter, even the ones you never notice.",
  },
  {
    title: "Flexibility",
    description: "Journeys should adapt to the traveler — not the other way around.",
  },
  {
    title: "Human Touch",
    description: "Travelers should have access to people who understand their journey, not a ticketing queue.",
  },
];

export function Standard() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The World Bridge Standard"
            title="The principles behind every journey we design."
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="border-t hairline pt-6">
                <h3 className="font-display text-lg text-ivory">{p.title}</h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">{p.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
