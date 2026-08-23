import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ComparePanel } from "@/components/account/ComparePanel";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Compare Journeys",
  description: "Compare your saved destinations, packages, cruises and journey stories side by side.",
};

export default function ComparePage() {
  return (
    <>
      <PageHero
        eyebrow="My World Bridge"
        title="Compare your saved journeys."
        description="A side-by-side look at the destinations, packages, cruises and journey stories you've saved on this device."
        image={themeImage("business", 1)}
        imageAlt="A notebook and travel documents on a table"
        size="sm"
      />
      <section className="py-16 md:py-24">
        <Container>
          <ComparePanel />
        </Container>
      </section>
    </>
  );
}
