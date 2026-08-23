import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { themeImage } from "@/data/images";

const styles = [
  { label: "Luxury Travel", href: "/luxury-travel", image: themeImage("luxuryResort", 0) },
  { label: "Bespoke Journeys", href: "/bespoke", image: themeImage("mountainNature", 1) },
  { label: "Arts & Culture", href: "/arts-culture", image: themeImage("culturalHeritage", 3) },
  { label: "Family Travel", href: "/family-travel", image: themeImage("peopleTravel", 1) },
  { label: "Couples Travel", href: "/couples-travel", image: themeImage("peopleTravel", 0) },
  { label: "Group Travel", href: "/group-travel", image: themeImage("peopleTravel", 2) },
  { label: "Cruises", href: "/cruises", image: themeImage("cruiseAndSea", 0) },
  { label: "Corporate Travel", href: "/corporate-travel", image: themeImage("cityscape", 4) },
];

export function TravelStyles() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Ways to Travel"
            title="A journey for every way of traveling."
            description="Every journey is shaped around the traveler — these are the shapes we build most often."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {styles.map((style, i) => (
            <Reveal key={style.href} delay={i * 60}>
              <Link href={style.href} className="group relative block aspect-square overflow-hidden rounded-card">
                <Image
                  src={style.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="img-zoom object-cover"
                />
                <div className="absolute inset-0 bg-ink/45 transition-colors group-hover:bg-ink/30" />
                <div className="absolute inset-0 flex items-end p-4 md:p-5">
                  <h3 className="font-display text-base md:text-lg text-ivory">
                    {style.label}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
