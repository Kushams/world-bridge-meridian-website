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

export const metadata: Metadata = {
  title: "Travel Gift Cards — Pay with Crypto",
  description: `Give the gift of travel. ${company.name} gift cards never expire, can be bought with cryptocurrency, and are used toward bespoke journeys.`,
};

const steps = [
  { title: "Sign in", body: "Create a free account with Google or email, or sign in." },
  { title: "Choose", body: "Pick a design and an amount from US$500." },
  { title: "Pay", body: "Pay in cryptocurrency and paste your transaction ID." },
  { title: "We verify", body: "Our team checks your payment on the blockchain." },
  { title: "Delivered", body: "The gift card code is emailed to you or your recipient." },
];

const faqs = [
  { q: "Does a gift card expire?", a: "No. Gift cards never expire." },
  { q: "What can I use it on?", a: `Journeys and services from ${company.name}. When you book, your consultant applies the balance and tells you what remains.` },
  { q: "How do I redeem a code?", a: "Sign in to My World Bridge, open Travel Credits and enter the code. The value becomes Travel Credits in your account, which never expire." },
  { q: "Can I get a refund?", a: "Gift cards are not refundable or exchangeable for cash once issued, except where the law requires. Full details are in the gift card terms." },
  { q: "How long does it take?", a: "We issue the card once your payment is verified on the blockchain. You'll get an email as soon as it's done." },
  { q: "I need more than US$25,000.", a: `Email ${company.email} and your consultant will arrange it.` },
];

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

      <section className="py-12 md:py-16">
        <Container>
          <ol className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-card border hairline p-4">
                <p className="font-display text-2xl text-gold">{i + 1}</p>
                <p className="mt-1 font-display text-lg text-ivory">{s.title}</p>
                <p className="mt-1 text-sm text-stone leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

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

      <NewToCrypto what="buy a gift card" />

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
          <FaqList items={faqs} className="mt-8 max-w-3xl" />
          <p className="mt-6 text-sm text-stone-dim">
            Read the full <Link href="/gift-card-terms" className="underline underline-offset-4">gift card terms &amp; conditions</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
