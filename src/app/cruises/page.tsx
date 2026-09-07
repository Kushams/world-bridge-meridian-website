import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CruisesExplorer } from "@/components/cruises/CruisesExplorer";
import { cruises } from "@/data/cruises";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Cruises",
  description:
    "Ocean and river cruise journeys organized by World Bridge Meridian, from the Mediterranean to Alaska, the Baltic and beyond.",
};

export default function CruisesPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Cruises"
        description="Ocean and river journeys across our cruise categories, organized end to end alongside land stays where you want them."
        image={themeImage("cruiseAndSea", 0)}
        imageAlt="Aerial view of tropical water"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-10 max-w-2xl text-sm text-stone-dim">
            {company.sampleDataDisclaimer} Sailings, cabin categories and pricing shown are
            starting points — availability and final pricing are confirmed directly with cruise
            operators once you enquire.
          </p>
          <CruisesExplorer cruises={cruises} />
        </Container>
      </section>
      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Ready to explore cruise journeys?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us the region, the ship style and who&apos;s sailing, and we&apos;ll build the rest of
            the journey around it — flights, pre- and post-cruise stays, and shore experiences.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Explore Cruise Journeys
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
