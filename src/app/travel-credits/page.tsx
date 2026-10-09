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
import { CreditsPurchase } from "@/components/credits/CreditsPurchase";
import { CREDIT_MAX, CREDIT_MIN, CASHBACK_TIERS, PROMO_MAX_SHARE, PROMO_VALID_DAYS, fmtUsd } from "@/lib/credits";

export const metadata: Metadata = {
  title: "Travel Credits — Buy Today, Travel Tomorrow",
  description: `Travel Credits are US-dollar credits in your ${company.name} account, bought with cryptocurrency and used toward your journeys. Credits you buy never expire.`,
};

const faqs = [
  {
    q: "How can I buy Travel Credits?",
    a: "Sign in to your account, choose an amount and pay with cryptocurrency on this page. Our team verifies your payment on the blockchain, then adds the credits to My World Bridge.",
  },
  {
    q: "How long are Travel Credits valid for?",
    a: `There are two types. Travel Credits that you buy, receive as a refund, or redeem from a gift card never expire. Promo Credits from promotions, vouchers and the Invite Program always have an expiry date (usually ${PROMO_VALID_DAYS} days), shown in your account.`,
  },
  {
    q: "Is there a limit on how many Travel Credits I can buy?",
    a: `No limit on how many you can hold. Each purchase is between ${fmtUsd(CREDIT_MIN)} and ${fmtUsd(CREDIT_MAX)}. For more, email ${company.email}.`,
  },
  {
    q: "What is the difference between Travel Credits and Promo Credits?",
    a: "Travel Credits are money you have paid or been refunded: they never expire and can cover up to 100% of any booking. Promo Credits are rewards: they expire, apply to larger bookings only, and are capped per booking.",
  },
  {
    q: "How do Promo Credits work?",
    a: `They are free credits from us (cashback, invite rewards, vouchers). Each batch lasts ${PROMO_VALID_DAYS} days from the day we give it. You can use them on any booking, up to ${Math.round(PROMO_MAX_SHARE * 100)}% of its price, for example up to ${fmtUsd(1000)} on a ${fmtUsd(4000)} journey. Unused Promo Credits expire.`,
  },
  {
    q: "How does cashback work?",
    a: `When a journey of ${fmtUsd(CASHBACK_TIERS[0].from)} or more is completed and paid, you get ${CASHBACK_TIERS.map((t) => `${t.pct}% from ${fmtUsd(t.from)}`).join(", ")} back as Promo Credits.`,
  },
  {
    q: "I have a gift card or voucher code.",
    a: "Open My World Bridge, go to Travel Credits and enter the code. A gift card becomes Travel Credits; a voucher becomes Promo Credits.",
  },
];

export default function TravelCreditsPage() {
  return (
    <>
      <PageHero
        eyebrow="Travel Credits"
        title="Buy today, travel tomorrow."
        description={`Travel Credits are US-dollar credits in your account. 1 credit = US$1. Pay with cryptocurrency, then use them toward any ${company.name} journey.`}
        image={themeImage("luxuryResort", 4)}
        imageAlt="A tropical resort at dusk"
        size="sm"
      />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { t: "What are Travel Credits?", b: `Credits you can use toward journeys with ${company.name}. They are in US dollars (1 credit = US$1) and are bought with cryptocurrency.` },
              { t: "How do I buy them?", b: "Create or sign in to your account, choose an amount, pay in crypto and paste the transaction ID. We verify it and add the credits." },
              { t: "How do I use them?", b: "Tell your consultant, or tick “Use my Travel Credits” on your journey request. Your consultant applies them to your booking and you pay any remainder as agreed." },
            ].map((c) => (
              <div key={c.t} className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">{c.t}</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <NewToCrypto what="buy Travel Credits" />

      <section id="buy" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Buy" title="Buy Travel Credits."
            description={<>Paying in crypto. <a href="#new-to-crypto" className="underline underline-offset-4">New to crypto? See how to buy it in your country.</a></>}
          />
          <div className="mt-8">
            <CreditsPurchase />
          </div>
        </Container>
      </section>

      <section id="rewards" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Rewards" title="Travel more, get cashback." />
          <p className="mt-4 max-w-2xl text-sm text-stone leading-relaxed">
            When a journey is completed and paid, we add a percentage of its total to your wallet as Promo Credits. They last {PROMO_VALID_DAYS} days from the day we give them, and you can use them on any booking, up to {Math.round(PROMO_MAX_SHARE * 100)}% of its price.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {CASHBACK_TIERS.map((t) => (
              <div key={t.from} className="rounded-card border hairline p-6">
                <p className="font-display text-4xl text-gold">{t.pct}%</p>
                <p className="mt-2 text-sm text-ivory">back on journeys of {fmtUsd(t.from)} or more</p>
                <p className="mt-1 text-xs text-stone-dim">e.g. {fmtUsd(t.from)} journey → {fmtUsd((t.from * t.pct) / 100)} in Promo Credits</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button href="/invite" variant="outline">Also earn by inviting friends</Button>
          </div>
        </Container>
      </section>

      <section id="credit-faq" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Questions" title="Travel Credit questions, answered." />
          <FaqList items={faqs} className="mt-8 max-w-3xl" />
        </Container>
      </section>

      <section className="border-t hairline py-10 md:py-14">
        <Container className="max-w-3xl">
          <p className="text-sm text-stone leading-relaxed">
            Read the full <Link href="/travel-credit-terms" className="underline underline-offset-4">Travel Credit &amp; Promo Credit terms</Link>, the{" "}
            <Link href="/gift-card-terms" className="underline underline-offset-4">gift card terms</Link> and the{" "}
            <Link href="/terms" className="underline underline-offset-4">Terms &amp; Booking Conditions</Link>.
          </p>
        </Container>
      </section>

      <section className="border-t hairline bg-charcoal py-14 md:py-20">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl text-ivory md:text-4xl">Ready to plan your next journey?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/plan-your-journey" size="lg">Plan Your Journey</Button>
            <Button href="/my-world-bridge#travel-credits" variant="outline" size="lg">My Travel Credits</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
