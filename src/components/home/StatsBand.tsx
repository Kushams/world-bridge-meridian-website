import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { company } from "@/data/company";
import { destinations } from "@/data/destinations";
import { travelStyles } from "@/data/travel-styles";

const regionCount = new Set(destinations.map((d) => d.region)).size;
const yearsActive = new Date().getFullYear() - company.foundedYear;

const stats = [
  { value: yearsActive, suffix: "", label: "Years organizing journeys" },
  { value: destinations.length, suffix: "+", label: "Destinations" },
  { value: regionCount, suffix: "", label: "Regions covered" },
  { value: travelStyles.length, suffix: "", label: "Ways to travel with us" },
];

export function StatsBand() {
  return (
    <section className="border-y hairline bg-charcoal py-14">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80} className="text-center">
              <p className="font-display text-4xl text-ivory md:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-stone-dim md:text-sm">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
