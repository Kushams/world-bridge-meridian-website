import Image from "next/image";
import { Container } from "@/components/ui/Container";
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
        </div>
      ) : (
        <div className="bg-grid-texture absolute inset-0 opacity-30" />
      )}
      <Container className="relative pb-14 pt-36 md:pb-16">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-3xl font-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-ivory text-balance-pretty">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-xl text-base md:text-lg text-ivory-dim leading-relaxed">
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
