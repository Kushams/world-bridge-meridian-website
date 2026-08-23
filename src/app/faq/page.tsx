import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about planning a journey with ${company.name}.`,
};

const faqs = [
  {
    q: "How does planning a journey with World Bridge Meridian work?",
    a: "It starts with a conversation, not a catalog. You tell us where you'd like to go (or simply what kind of experience you're after), who's traveling, when, and your general budget. We then propose an itinerary, refine it with you, and confirm accommodation, transportation and experiences before you travel.",
  },
  {
    q: "Do I need to know exactly where I want to go?",
    a: "No. Many clients start with a feeling — a type of experience, a season, a budget — rather than a specific destination. We help narrow it down from there.",
  },
  {
    q: "Are the prices shown on the website guaranteed?",
    a: "No. Prices shown throughout the site are indicative starting prices, used for planning purposes. Final pricing depends on travel dates, availability, accommodation selection, number of travelers and supplier pricing, and is confirmed after consultation and an availability check.",
  },
  {
    q: "How far in advance should I start planning?",
    a: "It depends on the destination and season. Popular honeymoon destinations and peak-season travel are best started six to nine months ahead; shoulder-season or less in-demand journeys can often be arranged with considerably less notice.",
  },
  {
    q: "Can you organize travel for a group, school, or corporate team?",
    a: "Yes. We coordinate group itineraries, accommodation, transportation and activities as a single journey rather than a stack of individual bookings — see our Group Travel and Corporate Travel pages for more detail.",
  },
  {
    q: "Do you book flights?",
    a: "We coordinate air travel as part of a full itinerary. World Bridge Meridian is not primarily a flight-booking service — our focus is organizing the journey around your flights, accommodation, transportation and experiences.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cryptocurrency (we've accepted it since 2015 — currently Bitcoin, USDT and Solana), card, and bank transfer. There's no online checkout on this site; payment details for whichever method you choose are confirmed with you directly once your journey is finalized. See our Payment Options page for detail, especially on how we handle cryptocurrency safely.",
  },
  {
    q: "Is my information secure?",
    a: "We take data handling seriously and do not store payment details ourselves. Details on data handling will be published in our Privacy Policy.",
  },
  {
    q: "What if something needs to change after I've booked?",
    a: "You'll have a direct point of contact throughout your journey. Changes are handled case by case, depending on the suppliers and timing involved.",
  },
  {
    q: "Do you have live availability for cruises and hotels shown on the site?",
    a: "Not yet for every listing. Cruise sailings and some current journeys shown on the site are sample or indicative data pending live supplier integration — these are clearly labeled. Availability is always confirmed at enquiry.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Frequently Asked Questions"
        image={themeImage("cityscape", 10)}
        imageAlt="A city street"
        size="sm"
      />
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl divide-y divide-line border-t hairline">
            {faqs.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ivory">
                  {item.q}
                  <span className="shrink-0 text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm text-stone leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
