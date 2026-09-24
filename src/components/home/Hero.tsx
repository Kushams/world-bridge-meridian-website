import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";
import { Parallax } from "@/components/motion/Parallax";
import { RevealText } from "@/components/motion/RevealText";
import { Magnetic } from "@/components/motion/Magnetic";
import { HeroBlurTransition } from "@/components/layout/HeroBlurTransition";
import { destinations } from "@/data/destinations";
import { travelStyles } from "@/data/travel-styles";

const heroMeta = [
  { label: "Organizing journeys since", value: company.foundedYear },
  { label: "Destinations", value: `${destinations.length}+` },
  { label: "Ways to travel", value: travelStyles.length },
];

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
        <div className="scrim-hero absolute inset-0" />
        <HeroBlurTransition />
      </div>

      <Container className="relative pb-20 pt-40 md:pb-28">
        <p className="eyebrow eyebrow-on-photo mb-6 reveal reveal-visible">{company.heroEyebrow}</p>
        <h1 className="max-w-4xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-on-photo sm:text-6xl md:text-7xl lg:text-8xl text-balance-pretty">
          {company.heroHeadlineLines.map((line, i) => (
            <RevealText key={i} text={line} delay={i * 0.15} className="block" />
          ))}
        </h1>
        <p className="mt-6 max-w-xl text-base text-on-photo-dim md:text-lg leading-relaxed">
          {company.tagline}
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Magnetic>
            <Button href="/plan-your-journey" variant="photo" size="lg">
              Design Your Journey
            </Button>
          </Magnetic>
          <Magnetic>
            <Button href="/explore" variant="photo-outline" size="lg">
              Explore Journeys
            </Button>
          </Magnetic>
        </div>

        <dl className="mt-14 hidden max-w-3xl grid-cols-3 gap-px overflow-hidden border-y border-on-photo-line/40 md:grid">
          {heroMeta.map((item) => (
            <div key={item.label} className="py-5 pr-8">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-on-photo-dim">
                {item.label}
              </dt>
              <dd className="mt-1 font-display text-xl text-on-photo">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
