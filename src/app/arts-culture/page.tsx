import type { Metadata } from "next";
import Link from "next/link";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { Container } from "@/components/ui/Container";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Arts & Culture Travel",
  description:
    "Museums, galleries, opera and heritage — cultural journeys designed by World Bridge Meridian for travelers who want to go deeper into a place.",
};

const whatsOnLinks = [
  { label: "Gallery Exhibitions", href: "/exhibitions" },
  { label: "Museum Exhibitions", href: "/museums" },
  { label: "Art Fairs", href: "/art-fairs" },
];

export default function ArtsCulturePage() {
  return (
    <SpecialtyPage
      eyebrow="Our Expertise"
      title="Travel through culture."
      intro="Museums, art galleries, opera, performing arts and heritage sites — journeys built for clients who travel to go deeper into a place, not just to see it."
      heroImage={themeImage("culturalHeritage", 8)}
      heroImageAlt="A museum gallery interior"
      travelStyle="arts-culture"
      afterHero={
        <div className="border-b hairline bg-charcoal py-10">
          <Container>
            <p className="eyebrow mb-4">What&apos;s On Now</p>
            <div className="flex flex-wrap gap-4">
              {whatsOnLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-line-strong px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ivory hover:bg-ivory hover:text-ink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Container>
        </div>
      }
      examples={[
        "Museums",
        "Art galleries",
        "Opera",
        "Performing arts",
        "Art fairs",
        "Exhibitions",
        "Cultural festivals",
        "Architecture",
        "Heritage & historic sites",
        "Artist travel",
        "Collector travel",
        "Institutional travel",
        "University cultural travel",
        "Cultural delegations",
      ]}
      ctaLabel="Plan a Cultural Journey"
    />
  );
}
