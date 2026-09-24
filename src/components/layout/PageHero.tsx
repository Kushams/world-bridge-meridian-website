import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HeroBlurTransition } from "@/components/layout/HeroBlurTransition";
import { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  size = "md",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  image?: string;
  imageAlt?: string;
  size?: "sm" | "md";
}) {
  return (
    <section
      className={`relative flex ${size === "sm" ? "min-h-[42vh]" : "min-h-[56vh]"} items-end overflow-hidden bg-charcoal`}
    >
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="scrim-hero absolute inset-0" />
          <HeroBlurTransition />
        </div>
      ) : (
        <div className="bg-grid-texture absolute inset-0 opacity-30" />
      )}
      <Container className="relative pb-14 pt-36 md:pb-16">
        <p className={`eyebrow mb-4 ${image ? "eyebrow-on-photo" : ""}`}>{eyebrow}</p>
        <h1
          className={`max-w-3xl font-display text-4xl md:text-6xl lg:text-7xl leading-[1.04] tracking-[-0.02em] text-balance-pretty ${
            image ? "text-on-photo" : "text-ivory"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={`mt-5 max-w-xl text-base md:text-lg leading-relaxed ${
              image ? "text-on-photo-dim" : "text-stone"
            }`}
          >
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
