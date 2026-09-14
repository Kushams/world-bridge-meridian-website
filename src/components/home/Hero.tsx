import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";
import { Parallax } from "@/components/motion/Parallax";
import { RevealText } from "@/components/motion/RevealText";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroBlurTransition } from "@/components/layout/HeroBlurTransition";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0 overflow-hidden">
        <Parallax offset={70} className="absolute -top-[12%] -bottom-[12%] left-0 right-0">
          <Image
            src={themeImage("culturalHeritage", 6, 2000)}
            alt="Machu Picchu rising through the morning mist, representative of World Bridge Meridian's curated journeys"
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/35" />
        <div className="bg-grid-texture absolute inset-0 opacity-20" />
        <HeroBlurTransition />
      </div>

      <Container className="relative pb-20 pt-40 md:pb-28">
        <p className="eyebrow mb-6 reveal reveal-visible">{company.heroEyebrow}</p>
        <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-ivory sm:text-5xl md:text-6xl lg:text-7xl text-balance-pretty">
          {company.heroHeadlineLines.map((line, i) => (
            <RevealText key={i} text={line} delay={i * 0.15} className="block" />
          ))}
        </h1>
        <p className="mt-6 max-w-xl text-base text-ivory-dim md:text-lg leading-relaxed">
          {company.tagline}
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Magnetic>
            <Button href="/plan-your-journey" size="lg">
              Design Your Journey
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href="/explore" variant="outline" size="lg">
              Explore Journeys
            </Button>
          </Magnetic>
        </div>
      </Container>
    </section>
  );
}
