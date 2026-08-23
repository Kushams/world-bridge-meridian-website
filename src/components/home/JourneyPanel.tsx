import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function JourneyPanel() {
  return (
    <section className="border-y hairline bg-charcoal py-20 md:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Begin With a Conversation</p>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.1] text-ivory text-balance-pretty">
            Tell us what you&apos;re imagining.
          </h2>
          <p className="mt-6 text-base md:text-lg text-stone leading-relaxed">
            You don&apos;t need to know every detail. Tell us where you&apos;d like to
            go, when you&apos;d like to travel, who you&apos;re traveling with and the
            kind of experience you&apos;re looking for.
          </p>
          <div className="mt-9">
            <Button href="/plan-your-journey" size="lg">
              Begin a Private Consultation
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
