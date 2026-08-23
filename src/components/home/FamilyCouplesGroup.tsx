import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { themeImage } from "@/data/images";

const tiles = [
  {
    label: "Family Travel",
    description: "Journeys that work for every generation traveling together.",
    href: "/family-travel",
    image: themeImage("peopleTravel", 1),
  },
  {
    label: "Couples Travel",
    description: "Honeymoons, anniversaries and journeys designed for two.",
    href: "/couples-travel",
    image: themeImage("peopleTravel", 0),
  },
  {
    label: "Group Travel",
    description: "Friends, institutions and delegations, coordinated end to end.",
    href: "/group-travel",
    image: themeImage("peopleTravel", 2),
  },
];

export function FamilyCouplesGroup() {
  return (
    <section className="py-20 md:py-28 bg-charcoal border-y hairline">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Who You're Traveling With"
            title="Built around the group in front of you."
            align="center"
            className="mx-auto"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiles.map((tile, i) => (
            <Reveal key={tile.href} delay={i * 100}>
              <Link href={tile.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="img-zoom object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl text-ivory">{tile.label}</h3>
                    <p className="mt-2 text-sm text-ivory-dim leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
