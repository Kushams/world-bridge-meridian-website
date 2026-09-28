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
    <section className="border-y hairline bg-charcoal py-14 md:py-16">
      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className={`px-0 py-5 sm:py-0 sm:px-8 sm:first:pl-0 ${
                i % 2 === 1 ? "border-l hairline pl-6 sm:pl-8" : ""
              } sm:border-l sm:first:border-l-0`}
            >
              <p className="figure-lg font-display text-5xl text-ivory md:text-6xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 max-w-[20ch] text-xs uppercase tracking-[0.14em] text-stone-dim">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
