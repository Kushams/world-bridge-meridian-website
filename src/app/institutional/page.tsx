import type { Metadata } from "next";
import Link from "next/link";
import { SpecialtyPage } from "@/components/specialty/SpecialtyPage";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Institutional Travel",
  description:
    "Travel coordination for universities, museums, galleries, alumni associations, professional bodies and cultural institutions, organized by World Bridge Meridian.",
};

const audiences = [
  "Universities and academic departments",
  "Museums and galleries",
  "Alumni associations",
  "Professional and trade associations",
  "Cultural and heritage institutions",
  "Schools and educational trusts",
  "Special-interest societies",
];

export default function InstitutionalPage() {
  return (
    <>
      <SpecialtyPage
        eyebrow="Our Expertise"
        title="Travel programs for institutions, not just individuals."
        intro="Universities, museums, galleries, alumni associations and professional bodies bring different requirements than a private trip — approvals, cohort sizes, accessibility needs and institutional budgets among them. We coordinate the full program: accommodation, transportation, experiences and on-the-ground logistics, reporting to one point of contact within your organization."
        heroImage={themeImage("culturalHeritage", 2)}
        heroImageAlt="A guided group inside a museum gallery"
        travelStyle="business"
        examples={[
          "Alumni study tours",
          "Museum patron trips",
          "Academic delegations",
          "Professional association conferences",
          "Cultural institution partnerships",
          "Donor and fundraising trips",
          "Multi-department programs",
        ]}
        ctaLabel="Plan an Institutional Journey"
        afterHero={
          <section className="py-16 md:py-20 border-b hairline">
            <Container>
              <SectionHeading eyebrow="Who We Work With" title="Built for organizations, not just travelers." />
              <div className="mt-8 flex flex-wrap gap-3">
                {audiences.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-line px-5 py-2.5 text-sm text-ivory-dim"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-8 max-w-2xl text-sm text-stone leading-relaxed">
                Looking for something more informal — friends, families or a corporate team? See{" "}
                <Link href="/group-travel" className="text-gold hover:text-ivory transition-colors">
                  Group Travel
                </Link>{" "}
                or{" "}
                <Link href="/corporate-travel" className="text-gold hover:text-ivory transition-colors">
                  Corporate Travel
                </Link>
                .
              </p>
            </Container>
          </section>
        }
      />
    </>
  );
}
