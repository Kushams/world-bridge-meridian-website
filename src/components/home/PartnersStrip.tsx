import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { partners, partnersStatement } from "@/data/partners";

export function PartnersStrip() {
  return (
    <section className="border-y hairline bg-charcoal py-16">
      <Container>
        <Reveal className="text-center">
          <p className="eyebrow mb-3">Our Network</p>
          <p className="mx-auto max-w-xl text-sm text-stone">{partnersStatement}</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 text-center sm:grid-cols-4">
          {partners.slice(0, 8).map((partner, i) => (
            <Reveal key={partner.category} delay={i * 50}>
              <p className="font-display text-sm md:text-base text-ivory-dim">
                {partner.category}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/partners" className="text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors">
            Learn About Our Partners
          </Link>
        </div>
      </Container>
    </section>
  );
}
