import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { themeImage } from "@/data/images";

const paths = [
  {
    eyebrow: "Path One",
    title: "Explore a Journey",
    description:
      "Discover curated destinations, travel packages, cruises and experiences created for the way you want to travel.",
    cta: "Explore Journeys",
    href: "/explore",
    image: themeImage("cityscape", 1),
  },
  {
    eyebrow: "Path Two",
    title: "Create Your Own Journey",
    description:
      "Have somewhere special in mind? Tell us what you're imagining and we'll help shape the journey around you.",
    cta: "Start Planning",
    href: "/plan-your-journey",
    image: themeImage("mountainNature", 5),
  },
];

export function CorePaths() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {paths.map((path, i) => (
            <Reveal key={path.href} delay={i * 120}>
              <div className="group relative h-[420px] overflow-hidden rounded-card md:h-[520px]">
                <Image
                  src={path.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="img-zoom object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
                <Link
                  href={path.href}
                  aria-label={path.title}
                  className="absolute inset-0 z-10"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8 md:p-10">
                  <p className="eyebrow mb-3">{path.eyebrow}</p>
                  <h2 className="font-display text-2xl md:text-3xl text-ivory">
                    {path.title}
                  </h2>
                  <p className="mt-3 max-w-sm text-sm text-ivory-dim leading-relaxed">
                    {path.description}
                  </p>
                  <span className="pointer-events-auto relative z-20 mt-6 inline-block">
                    <Button href={path.href} variant="outline">
                      {path.cta}
                    </Button>
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
