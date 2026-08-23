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
    <section className="py-20 md:py-28">
      <Container>
        <div
          className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 ${
            reverse ? "md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-card">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h2 className="font-display text-3xl md:text-4xl leading-[1.1] text-ivory text-balance-pretty">
              {title}
            </h2>
            <p className="mt-5 text-base text-stone leading-relaxed">{description}</p>
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
