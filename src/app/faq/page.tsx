import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SITE_URL, company } from "@/data/company";
import { JsonLd } from "@/components/seo/JsonLd";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about planning a journey with ${company.name}.`,
};

const faqs = [
  {
    q: "What is World Bridge Meridian?",
    a: `${company.name} is a bespoke travel group founded in ${company.foundedYear} by ${company.founderName}. We design private, made-to-measure journeys — luxury escapes, cultural and arts travel, family holidays, honeymoons, group departures, corporate travel and cruises — planned around the people taking them rather than sold from a catalog.`,
  },
  {
    q: "What kinds of trips does World Bridge Meridian plan?",
    a: "Bespoke and private journeys, luxury travel, arts and culture trips built around exhibitions, museums and art fairs, family travel, couples travel and honeymoons, group and institutional travel, corporate travel, and cruises. Destinations span North America, Europe, the Middle East & Africa, Asia-Pacific and the Indian Ocean.",
  },
  {
    q: "How do I contact World Bridge Meridian?",
    a: `Email ${company.email}${company.phone ? `, call ${company.phone}` : ""}, use the contact form on our Contact page, or start a request with the Plan Your Journey form. A travel designer replies personally.`,
  },
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
    a: "Bank transfer, arranged by the consultant assigned to your booking (including local-currency transfers through our regional payment intermediaries in many countries), and cryptocurrency, which we've accepted since 2015 — Bitcoin, Ethereum, USDT, USDC and Solana. There's no online checkout; payment details are confirmed with you directly once your journey is finalized. Our Payment Options page explains each method and includes a step-by-step guide to buying crypto in your country.",
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: `${SITE_URL}/faq`,
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
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
