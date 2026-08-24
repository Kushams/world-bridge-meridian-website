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
        eyebrow="Journey Consultation"
        title="Let's design something extraordinary."
        description="You don't need to have everything figured out. Tell us what you know, what you love, and what you want to experience — we'll help shape the journey."
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
