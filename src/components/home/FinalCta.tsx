import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { themeImage } from "@/data/images";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0">
        <Image
          src={themeImage("mountainNature", 0, 1800)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/80" />
      </div>
      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-5xl leading-[1.1] text-ivory text-balance-pretty">
            The world feels different when it is yours to explore.
          </h2>
          <p className="mt-6 text-base md:text-lg text-ivory-dim leading-relaxed">
            Wherever you&apos;re imagining, we can help organize the journey around it.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button href="/plan-your-journey" size="lg">
              Plan Your Journey
            </Button>
            <Button href="/explore" variant="outline" size="lg">
              Explore Journeys
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
