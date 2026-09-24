import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";

export function Philosophy() {
  return (
    <section className="py-24 md:py-36">
      <Container>
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-8">
            <span aria-hidden className="mb-8 block h-px w-24 bg-gold/70" />
            <h2 className="display-xl font-display text-[2.4rem] leading-[1.06] tracking-[-0.025em] text-ivory sm:text-5xl md:text-6xl lg:text-7xl text-balance-pretty">
              {company.philosophyLine.map((line, i) => (
                <span key={i} className={i === 1 ? "block italic text-gold" : "block"}>
                  {line}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal delay={140} className="md:col-span-4 md:self-end">
            <p className="max-w-sm border-t hairline pt-6 text-base text-stone leading-relaxed">
              We don&apos;t just book trips. We design journeys — built from a conversation
              about who&apos;s traveling, not chosen from a shelf of fixed itineraries.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
