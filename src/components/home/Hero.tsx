import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { HeroBlurTransition } from "@/components/layout/HeroBlurTransition";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { localImage } from "@/data/images";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-ink lg:flex lg:min-h-[100svh] lg:items-end">
      {/* Phone/tablet: the picture on top, fading into the page. Desktop: the picture fills the whole screen behind the words. */}
      <div className="relative mt-[4.5rem] aspect-[1254/790] w-full md:mt-[5.5rem] lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
        <Image
          src={localImage("/images/brand/hero-art.jpg")}
          alt="A passport, boarding pass, globe, camera and phone under a bright blue sky, with photos of resorts, Santorini, Dubai and an African safari"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)] lg:object-[62%_50%] lg:[mask-image:none]"
        />
        <div className="scrim-hero absolute inset-0 hidden lg:block" />
        <div className="hidden lg:block">
          <HeroBlurTransition />
        </div>
      </div>

      <Container className="relative pb-12 pt-3 md:pb-16 lg:pb-28 lg:pt-40">
        <p className="eyebrow mb-5 reveal reveal-visible lg:!text-[color:var(--color-gold-bright)]">{company.heroEyebrow}</p>
        <h1 className="max-w-4xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-ivory sm:text-6xl md:text-7xl lg:text-8xl lg:text-on-photo text-balance-pretty">
          {company.heroHeadlineLines.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-xl text-base text-stone leading-relaxed md:text-lg lg:text-on-photo-dim">{company.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-4 lg:hidden">
          <Button href="/plan-your-journey" size="lg">
            Design Your Journey
          </Button>
          <Button href="/explore" variant="outline" size="lg">
            Explore Journeys
          </Button>
        </div>
        <div className="mt-9 hidden flex-wrap gap-4 lg:flex">
          <Button href="/plan-your-journey" variant="photo" size="lg">
            Design Your Journey
          </Button>
          <Button href="/explore" variant="photo-outline" size="lg">
            Explore Journeys
          </Button>
        </div>
      </Container>
    </section>
  );
}
