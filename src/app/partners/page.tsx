import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { partners, partnersStatement } from "@/data/partners";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Partners",
  description: "Selected hospitality and travel partners working with World Bridge Meridian.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Partners"
        description={partnersStatement}
        image={themeImage("cityscape", 2)}
        imageAlt="A city street"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="max-w-2xl text-sm text-stone-dim leading-relaxed">
            We work with a network of hospitality and travel partners across the destinations we
            organize journeys to. Until specific named partnerships are confirmed and ready to
            publish, we describe our network by category rather than by name.
          </p>
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner) => (
              <div key={partner.category} className="border-t hairline pt-6">
                <h3 className="font-display text-lg text-ivory">{partner.category}</h3>
                <p className="mt-3 text-sm text-stone leading-relaxed">{partner.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
