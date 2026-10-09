import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { localImage } from "@/data/images";

/** The brand poster ("More than a trip. It's a bigger world.") shown at its natural size so it stays sharp. */
export function BrandPoster() {
  return (
    <section className="py-14 md:py-24">
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <Reveal>
            <Image
              src={localImage("/images/brand/more-than-a-trip.jpg")}
              alt="World Bridge Meridian: more than a trip, it's a bigger world. A passport, boarding pass, globe, camera and phone against a bright sky."
              width={1254}
              height={1254}
              sizes="(min-width: 768px) 520px, 100vw"
              className="mx-auto h-auto w-full max-w-[520px] rounded-card shadow-[0_24px_60px_-24px_rgba(20,60,100,0.45)]"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-4">More than a trip</p>
            <h2 className="font-display text-3xl leading-tight tracking-[-0.02em] text-ivory md:text-5xl">It&apos;s a bigger world.</h2>
            <p className="mt-5 max-w-md text-base text-stone leading-relaxed">
              We design journeys, we don&apos;t book trips. Tell us who is travelling and what you love, and your consultant builds the journey around you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/plan-your-journey">Plan Your Journey</Button>
              <Button href="/explore" variant="outline">Explore Journeys</Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
