import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FeatureBanner({
  eyebrow,
  title,
  description,
  cta,
  href,
  image,
  imageAlt,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div
          className={`grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-16 ${
            reverse ? "md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <Reveal
            className={`relative aspect-[4/3] overflow-hidden rounded-card md:col-span-7 md:aspect-[5/4] ${
              reverse ? "md:col-start-6" : ""
            }`}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120} className="md:col-span-5">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold/60" />
              {eyebrow}
            </p>
            <h2 className="display-xl font-display text-[2rem] md:text-4xl lg:text-5xl leading-[1.06] tracking-[-0.02em] text-ivory text-balance-pretty">
              {title}
            </h2>
            <p className="mt-6 border-t hairline pt-6 text-base text-stone leading-relaxed">
              {description}
            </p>
            <div className="mt-8">
              <Button href={href} variant="outline">
                {cta}
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
