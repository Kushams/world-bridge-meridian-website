import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { NewToCrypto } from "@/components/payments/NewToCrypto";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqList } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";
import { GiftCardPurchase } from "@/components/gift-cards/GiftCardPurchase";
import { faqGiftCards } from "@/data/pageFaqs";

export const metadata: Metadata = {
  title: "Travel Gift Cards — Pay with Crypto",
  description: `Give the gift of travel. ${company.name} gift cards never expire, can be bought with cryptocurrency, and are used toward bespoke journeys.`,
};


export default function GiftCardsPage() {
  return (
    <>
      <PageHero
        eyebrow="Gift cards"
        title="Give the gift of travel."
        description="A World Bridge Meridian gift card never expires, can be bought with cryptocurrency, and goes toward a journey designed around the person receiving it."
        image={themeImage("luxuryResort", 2)}
        imageAlt="A luxury resort at sunset"
        size="sm"
      />

      <NewToCrypto what="buy a gift card" />

      <section id="buy" className="scroll-mt-24 pb-16 md:pb-24">
        <Container>
          <SectionHeading eyebrow="Buy" title="Order a gift card."
            description={<>Paying in crypto. <a href="#new-to-crypto" className="underline underline-offset-4">New to crypto? See how to buy it in your country.</a></>}
          />
          <div className="mt-8">
            <GiftCardPurchase />
          </div>
        </Container>
      </section>

      <section id="redeem" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <SectionHeading eyebrow="Have a code?" title="Redeem your gift card." />
            <p className="mt-3 text-sm text-stone leading-relaxed">
              Sign in, add your code, and your balance is ready for your next journey.
            </p>
          </div>
          <Button href="/my-world-bridge#gift-cards" size="lg">Redeem a gift card</Button>
        </Container>
      </section>

      <section id="gift-card-questions" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Questions" title="Gift card questions, answered." />
          <FaqList items={faqGiftCards} className="mt-8 max-w-3xl" />
          <p className="mt-6 text-sm text-stone-dim">
            Read the full <Link href="/gift-card-terms" className="underline underline-offset-4">gift card terms &amp; conditions</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
