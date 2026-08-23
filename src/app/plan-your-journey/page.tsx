import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { JourneyWizard } from "@/components/plan/JourneyWizard";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Plan Your Journey",
  description:
    "Tell World Bridge Meridian what you're imagining — destination, dates, travelers, style and budget — and we'll help shape the journey around you.",
};

export default function PlanYourJourneyPage() {
  return (
    <>
      <PageHero
        eyebrow="Begin With a Conversation"
        title="Plan Your Journey"
        description="You don't need to know every detail. Answer what you can — we'll take it from there."
        image={themeImage("mountainNature", 3)}
        imageAlt="A scenic landscape"
        size="sm"
      />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <JourneyWizard />
        </Container>
      </section>
    </>
  );
}
