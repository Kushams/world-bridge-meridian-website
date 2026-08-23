import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { SavedJourneysPanel } from "@/components/account/SavedJourneysPanel";

export const metadata: Metadata = {
  title: "My World Bridge",
  description: "Your World Bridge Meridian account — saved journeys, destinations, cruises and enquiries.",
};

const features = [
  {
    title: "My Enquiries",
    description: "Track the status of journey requests you've submitted.",
  },
  {
    title: "Itineraries & Documents",
    description: "Access confirmed itineraries and travel documents in one place.",
  },
  {
    title: "Travel Preferences & Profile",
    description: "Store your travel preferences so future journeys start from what we already know.",
  },
];

export default function MyWorldBridgePage() {
  return (
    <>
      <PageHero
        eyebrow="My World Bridge"
        title="Your World Bridge Meridian account"
        description="Account sign-in isn't connected yet, but saved journeys work right now — stored in this browser, no account required."
        image={themeImage("business", 3)}
        imageAlt="A desk with a notebook"
        size="sm"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-xl rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
            <p className="eyebrow mb-4">Coming Soon</p>
            <h2 className="font-display text-2xl md:text-3xl text-ivory">
              Account sign-in isn&apos;t connected yet
            </h2>
            <p className="mt-4 text-stone leading-relaxed">
              We&apos;re building customer accounts so you can track enquiries and revisit past
              itineraries across devices. In the meantime, every journey request is tracked
              directly by our team — reach out any time to check on yours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/plan-your-journey">Plan Your Journey</Button>
              <Button href="/contact" variant="outline">
                Contact Us
              </Button>
            </div>
          </div>

          <div className="mt-20">
            <SavedJourneysPanel />
          </div>

          <div className="mt-20">
            <p className="eyebrow mb-8 text-center">What&apos;s Coming</p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="border-t hairline pt-5">
                  <h3 className="font-display text-lg text-ivory">{f.title}</h3>
                  <p className="mt-2 text-sm text-stone leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
