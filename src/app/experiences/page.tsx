import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ExperiencesExplorer } from "@/components/experiences/ExperiencesExplorer";
import { experiences } from "@/data/experiences";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Curated experiences from World Bridge Meridian — food & wine, culture, museums, opera, adventure, wellness and more, built into your journey.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Experiences"
        description="The moments that make a journey memorable — arranged privately, at the pace you want."
        image={themeImage("foodAndWine", 1)}
        imageAlt="A fine dining table setting"
      />
      <section className="py-16 md:py-24">
        <Container>
          <ExperiencesExplorer experiences={experiences} />
        </Container>
      </section>
    </>
  );
}
