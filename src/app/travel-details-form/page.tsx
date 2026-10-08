import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { TravelDetailsForm } from "@/components/forms/TravelDetailsForm";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Travel Detail & Itinerary Form",
  description: `Complete your travel details for ${company.name} so we can tailor your journey and manage logistics.`,
  // Contains personal and passport details and is only sent to clients by
  // their representative, so keep it out of search results.
  robots: { index: false, follow: false },
};

export default function TravelDetailsFormPage() {
  return (
    <>
      <PageHero
        eyebrow="Travel Details"
        title="Travel Detail & Itinerary Form"
        description={`To ensure a seamless and carefully curated cultural travel experience, please complete this form. The information will allow us to tailor your journey, manage logistics efficiently and accommodate any specific requirements. Please complete all sections accurately.`}
        image={themeImage("culturalHeritage", 8)}
        imageAlt="The interior of a grand domed building"
      />
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <TravelDetailsForm />
          </div>
        </Container>
      </section>
    </>
  );
}
