import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { localImage } from "@/data/images";

export function Hero() {
  const art = (
    <Image
      src={localImage("/images/brand/hero-art.jpg")}
      alt="A passport, boarding pass, globe, camera and phone under a bright blue sky, with photos of resorts, Santorini, Dubai and an African safari"
      fill
      priority
      sizes="(min-width: 1024px) 62vw, 100vw"
      className="object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,#000_16%,#000_84%,transparent_100%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_30%)]"
    />
  );

  return (
    <section className="relative w-full overflow-hidden bg-[linear-gradient(160deg,#0d6aa3_0%,#0a4f7e_55%,#073a5e_100%)] text-on-photo">
      {/* Phone: picture on top, words below. Desktop: picture fills the right side, words on the left. */}
      <div className="relative mt-[4.5rem] md:mt-[5.5rem] aspect-[1254/790] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-[62%]">{art}</div>

      <Container className="relative pb-12 pt-4 md:pb-16 lg:flex lg:min-h-[100svh] lg:items-end lg:pb-24 lg:pt-40">
        <div className="lg:max-w-[46rem]">
          <p className="eyebrow eyebrow-on-photo mb-5 reveal reveal-visible">{company.heroEyebrow}</p>
          <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.02em] text-on-photo sm:text-6xl md:text-7xl lg:text-8xl text-balance-pretty">
            {company.heroHeadlineLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-base text-on-photo-dim md:text-lg leading-relaxed">{company.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/plan-your-journey" variant="photo" size="lg">
              Design Your Journey
            </Button>
            <Button href="/explore" variant="photo-outline" size="lg">
              Explore Journeys
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
