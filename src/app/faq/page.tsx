import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FaqList } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SITE_URL, company } from "@/data/company";
import { JsonLd } from "@/components/seo/JsonLd";
import { themeImage } from "@/data/images";
import { faqMain } from "@/data/pageFaqs";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about planning a journey with ${company.name}.`,
};


export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: `${SITE_URL}/faq`,
          mainEntity: faqMain.map((item) => ({
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
          <FaqList items={faqMain} className="mx-auto max-w-3xl" />
        </Container>
      </section>
    </>
  );
}
