import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  "Destination",
  "Dates",
  "Travelers",
  "Journey type",
  "Interests",
  "Pace & stay",
  "Investment",
  "What to organize",
  "Contact",
  "Final notes",
];

/** Puts the 10-step journey planner right under the hero, where visitors look first. */
export function PlannerBand() {
  return (
    <section className="border-b hairline bg-charcoal py-10 md:py-14">
      <Container>
        <Reveal>
          <div className="grid items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-12">
            <div>
              <p className="eyebrow mb-3">Plan Your Journey</p>
              <h2 className="font-display text-2xl leading-tight text-ivory text-balance-pretty md:text-4xl">
                Design your journey in 10 quick steps.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-stone leading-relaxed md:text-base">
                Tell us where, when and how you like to travel. It takes a couple of minutes, and a
                consultant takes it from there.
              </p>
              <div className="mt-6">
                <Button href="/plan-your-journey" size="lg">
                  Start Planning
                </Button>
              </div>
            </div>
            <ol className="flex flex-wrap gap-2">
              {steps.map((label, i) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-line bg-ink px-3.5 py-1.5 text-xs text-ivory-dim"
                >
                  <span className="font-display text-gold">{i + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
