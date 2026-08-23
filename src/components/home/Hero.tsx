import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image
          src={themeImage("tropicalBeach", 3, 2000)}
          alt="Overwater villas at dusk, representative of World Bridge Meridian's curated journeys"
          fill
          priority
          sizes="100vw"
          className="hero-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
        <div className="bg-grid-texture absolute inset-0 opacity-20" />
      </div>

      <Container className="relative pb-20 pt-40 md:pb-28">
        <p className="eyebrow mb-6 reveal reveal-visible">{company.heroEyebrow}</p>
        <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-ivory sm:text-5xl md:text-6xl lg:text-7xl text-balance-pretty">
          {company.heroHeadlineLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-xl text-base text-ivory-dim md:text-lg leading-relaxed">
          {company.tagline}
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="/plan-your-journey" size="lg">
            Plan Your Journey
          </Button>
          <Button href="/explore" variant="outline" size="lg">
            Explore Journeys
          </Button>
        </div>
      </Container>
    </section>
  );
}
