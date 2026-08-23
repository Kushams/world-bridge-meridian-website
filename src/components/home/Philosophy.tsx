import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";

export function Philosophy() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl leading-[1.15] text-ivory sm:text-4xl md:text-5xl text-balance-pretty">
            {company.philosophyLine.map((line, i) => (
              <span key={i} className={i === 1 ? "block italic text-gold" : "block"}>
                {line}
              </span>
            ))}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-stone leading-relaxed md:text-lg">
            We don&apos;t just book trips. We design journeys — built from a conversation
            about who&apos;s traveling, not chosen from a shelf of fixed itineraries.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
