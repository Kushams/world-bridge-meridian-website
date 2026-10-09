import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";
import { creditTerms, creditTermsIntro } from "@/data/creditTerms";
import { CreditsPurchase } from "@/components/credits/CreditsPurchase";
import { CREDIT_MAX, CREDIT_MIN, PROMO_TIERS, PROMO_VALID_DAYS, fmtUsd } from "@/lib/credits";

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

      <section id="buy" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Buy" title="Buy Travel Credits." />
          <div className="mt-8">
            <CreditsPurchase />
          </div>
        </Container>
      </section>

      <section id="credit-faq" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Questions" title="Travel Credit questions, answered." />
          <div className="mt-8 max-w-3xl divide-y divide-line border-t hairline">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ivory">
                  {f.q}
                  <span aria-hidden className="shrink-0 text-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-stone leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section id="credit-terms" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Terms" title="Travel Credit & Promo Credit terms." />
          <p className="mt-4 text-sm text-stone leading-relaxed">{creditTermsIntro}</p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-stone leading-relaxed marker:text-gold">
            {creditTerms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <div className="mt-8 overflow-hidden rounded-card border hairline">
            <table className="w-full text-sm">
              <caption className="border-b hairline p-4 text-left text-xs font-semibold uppercase tracking-wide text-ivory">
                Promo Credits you can use on one booking
              </caption>
              <thead className="text-left text-xs uppercase tracking-wide text-stone">
                <tr><th className="p-3 font-medium">Booking total</th><th className="p-3 font-medium">Most Promo Credits</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr><td className="p-3 text-stone">Less than {fmtUsd(PROMO_TIERS[0].from)}</td><td className="p-3 text-ivory">Not available</td></tr>
                {PROMO_TIERS.map((t) => (
                  <tr key={t.from}>
                    <td className="p-3 text-stone">{t.to ? `${fmtUsd(t.from)} to ${fmtUsd(t.to)}` : `${fmtUsd(t.from)} or more`}</td>
                    <td className="p-3 text-ivory">{t.to ? fmtUsd(t.max) : `${fmtUsd(t.max)}, then +${fmtUsd(100)} for every ${fmtUsd(2000)} more`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-sm text-stone-dim">
            Also see the <Link href="/terms" className="underline underline-offset-4">Terms &amp; Booking Conditions</Link> and the{" "}
            <Link href="/gift-card-terms" className="underline underline-offset-4">gift card terms</Link>.
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
