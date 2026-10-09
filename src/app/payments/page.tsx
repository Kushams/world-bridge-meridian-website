import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MobileCollapse } from "@/components/ui/MobileCollapse";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";
import { CryptoPaymentPanel } from "@/components/payments/CryptoPaymentPanel";
import { enabledCryptoPaymentOptions } from "@/data/cryptoPayments";
import { cryptoBuyingSteps, cryptoGuideReviewed } from "@/data/cryptoBuyingGuide";
import { CryptoCountryGuide } from "@/components/payments/CryptoCountryGuide";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Payment Options — Bank Transfer & Cryptocurrency",
  description: `How payment works with ${company.name}: bank transfer arranged by your consultant, regional payment intermediaries, and cryptocurrency — with a country-by-country guide to buying crypto and sending it safely.`,
};

const processSteps = [
  {
    title: "Your journey is confirmed",
    body: "Your consultant finalizes the itinerary and price with you. Nothing is paid before that.",
  },
  {
    title: "You receive payment instructions",
    body: "Your assigned consultant sends the amount and the method — bank transfer, a regional intermediary, or cryptocurrency.",
  },
  {
    title: "You pay",
    body: "Transfer the agreed amount using only the details your consultant gave you, or the wallet addresses published on this page.",
  },
  {
    title: "We confirm receipt",
    body: "Our team verifies every payment and confirms it with you in writing before your bookings are secured.",
  },
];

const cryptoAssets = Array.from(new Set(enabledCryptoPaymentOptions().map((o) => o.asset)));

const paymentFaqs = [
  {
    question: `How do I pay ${company.name}?`,
    answer: `Once your journey is confirmed, your assigned consultant sends payment instructions. You can pay by bank transfer arranged through your consultant, through one of our regional payment intermediaries in local currency, or in cryptocurrency (${cryptoAssets.join(", ")}). There is no online checkout.`,
  },
  {
    question: "How do bank transfers work?",
    answer:
      "Bank transfers are arranged by the consultant assigned to your booking. They issue the transfer details for your specific booking — these are never published on the website. In many countries we work with vetted intermediaries who accept the transfer in your local currency.",
  },
  {
    question: "How do I buy cryptocurrency to pay for my trip?",
    answer:
      "Open an account with a regulated exchange in your country, verify your identity, deposit local currency, buy the asset your consultant specified (stablecoins such as USDC or USDT are simplest), then withdraw to the World Bridge Meridian address on this page using the correct network. Submit the transaction ID with the form on the payments page.",
  },
  {
    question: "What happens if I send crypto on the wrong network?",
    answer:
      "Funds sent on the wrong network or to the wrong address may be permanently lost. Always match the asset and network to the address shown on the payments page, and send a small test first for large payments.",
  },
  {
    question: "How do I know a payment request is genuine?",
    answer:
      "We only ever request payment through the consultant assigned to your booking, and we only collect cryptocurrency at the addresses published on our payments page. If anyone asks you to pay a different person, company or address, contact us before paying.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: paymentFaqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function PaymentsPage() {
  const addressesPublished = isSupabaseConfigured && enabledCryptoPaymentOptions().length > 0;

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <PageHero
        eyebrow="Payments"
        title="How payment works."
        description="No online checkout, no card details. We confirm your journey first, then your consultant tells you exactly how to pay."
        image={themeImage("business", 1)}
        imageAlt="A workspace"
      />

      {/* 1. The whole process, at a glance */}
      <section id="how-it-works" className="scroll-mt-24 py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Step by step" title="Four steps, always in this order." />
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-card border hairline p-5 lg:block">
                <span className="font-display text-3xl text-gold">{i + 1}</span>
                <span className="block">
                  <span className="block font-display text-lg text-ivory lg:mt-3">{step.title}</span>
                  <span className="mt-1 block text-sm text-stone leading-relaxed">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 2. Safety, once, up front */}
      <Container>
        <div className="rounded-card border border-gold/50 bg-gold/5 p-6 md:p-8">
          <p className="font-display text-xl text-ivory md:text-2xl">Pay only where your consultant tells you.</p>
          <p className="mt-2 text-sm text-stone leading-relaxed md:text-base">
            We never ask you to pay a person, company or account you weren&apos;t introduced to by your
            assigned consultant. If anyone else asks for payment on our behalf, check with us first at{" "}
            <a href={`mailto:${company.email}`} className="text-ivory underline underline-offset-4">
              {company.email}
            </a>
            .
          </p>
        </div>
      </Container>

      {/* 3. Pick a method */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Your choice" title="How would you like to pay?" />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <a
              href="#bank-transfer"
              className="group rounded-card border hairline p-6 transition-colors hover:border-gold md:p-8"
            >
              <p className="font-display text-2xl text-ivory">Bank transfer</p>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                Your consultant sends the details. You can pay in your own currency through a local
                intermediary if that&apos;s easier.
              </p>
              <span className="mt-5 inline-block text-sm font-semibold uppercase tracking-wide text-gold group-hover:underline">
                See how it works →
              </span>
            </a>
            <a
              href="#cryptocurrency"
              className="group rounded-card border hairline p-6 transition-colors hover:border-gold md:p-8"
            >
              <p className="font-display text-2xl text-ivory">Cryptocurrency</p>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                {cryptoAssets.join(", ")}. New to crypto? We show you where to buy it in your country, step
                by step.
              </p>
              <span className="mt-5 inline-block text-sm font-semibold uppercase tracking-wide text-gold group-hover:underline">
                See how it works →
              </span>
            </a>
          </div>
          <p className="mt-4 text-sm text-stone-dim">Not sure which? Ask your consultant — they&apos;ll recommend the simplest one for you.</p>
        </Container>
      </section>

      {/* 4. Bank transfer */}
      <section id="bank-transfer" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Option 1" title="Bank transfer." />
          <ul className="mt-6 max-w-2xl space-y-3 text-base text-stone leading-relaxed">
            <li className="flex gap-3"><span aria-hidden className="text-gold">✓</span><span>Your consultant sends the <span className="text-ivory">amount, currency, beneficiary and reference</span> for your booking.</span></li>
            <li className="flex gap-3"><span aria-hidden className="text-gold">✓</span><span>Bank details are <span className="text-ivory">never published</span> on this website.</span></li>
            <li className="flex gap-3"><span aria-hidden className="text-gold">✓</span><span>Can&apos;t easily pay in dollars or euros? You may be able to pay a <span className="text-ivory">local intermediary in your own currency</span>.</span></li>
            <li className="flex gap-3"><span aria-hidden className="text-gold">✓</span><span>Always use the <span className="text-ivory">reference your consultant gives you</span>, so we match your payment quickly.</span></li>
          </ul>
          <MobileCollapse label="More about local-currency payment">
            <div className="mt-2 max-w-3xl space-y-4 text-sm text-stone leading-relaxed md:text-base">
              <p>
                Every client is assigned a consultant, and bank transfers are arranged through them. We work
                with vetted payment intermediaries in many countries and regions. Where paying in US dollars
                or euros isn&apos;t practical — because of currency controls, banking restrictions, high
                international fees, or simply a preference for your own currency — your consultant can
                arrange for you to pay a local intermediary in your local currency, who then remits the
                payment to {company.name} on your behalf.
              </p>
              <p>
                This is arranged per booking. If an intermediary applies to your journey, your consultant
                will introduce them by name and confirm the amount and currency before anything changes
                hands. Ask your consultant whether one is available where you are.
              </p>
              <p>
                This site never asks for a card number or bank login. The only payment information
                submitted here is a cryptocurrency transaction reference.
              </p>
            </div>
          </MobileCollapse>
        </Container>
      </section>

      {/* 5. Crypto: buy -> send -> tell us */}
      <section id="cryptocurrency" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Option 2"
            title="Cryptocurrency."
            description={`Accepted since ${company.cryptoAcceptedSince}: ${company.cryptoCurrencies.join(", ")}. Three steps: buy it, send it, tell us you've sent it.`}
          />
          <p className="mt-4 max-w-2xl text-sm text-stone leading-relaxed">
            {addressesPublished
              ? "Amounts are never quoted here. Once your itinerary is final, your consultant confirms the exact amount, asset and network. The wallet addresses on this page are our own — they are the only addresses we ever collect cryptocurrency at. If an address from anyone else doesn't match, don't send to it; contact us first."
              : "Amounts are never quoted here, and no address is published on this page at the moment. Once your itinerary is final, your consultant sends the exact amount, asset, network and address for your booking. Only send to an address you were given through a confirmed conversation about your own journey."}
          </p>

          <div id="buy-crypto" className="mt-10 scroll-mt-24">
            <p className="font-display text-xl text-gold">Step 1 · Buy it</p>
            <div className="mt-5 max-w-3xl">
              <CryptoCountryGuide />
            </div>
          </div>

          <div id="send-safely" className="mt-12 scroll-mt-24">
            <p className="font-display text-xl text-gold">Step 2 · Send it safely</p>
            <p className="mt-1 text-sm text-stone">Follow these in order so it reaches the right address on the right network.</p>
            <MobileCollapse label="Show the sending steps">
              <ol className="mt-4 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
                {cryptoBuyingSteps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/60 font-display text-gold"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-display text-lg text-ivory">{step.title}</p>
                      <p className="mt-1 text-sm text-stone leading-relaxed">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 max-w-md rounded-card border hairline p-5">
                <p className="font-display text-lg text-ivory">Accepted assets &amp; networks</p>
                <ul className="mt-3 divide-y divide-line">
                  {enabledCryptoPaymentOptions().map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                      <span className="text-ivory">{o.asset}</span>
                      <span className="text-right text-stone">{o.network}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-stone-dim leading-relaxed">
                  Send each asset only on the network listed. The wrong network can mean permanent loss.
                </p>
              </div>
              <p className="mt-6 max-w-3xl text-xs text-stone-dim leading-relaxed">
                Exchanges are listed as commonly used examples, not endorsements or partners of {company.name}.
                Availability, licensing and supported assets change — confirm the provider is licensed where
                you live. Not financial or tax advice. Guide last reviewed {cryptoGuideReviewed}. Country not
                listed, or can&apos;t buy crypto where you are? Ask your consultant about bank transfer or a
                regional intermediary.
              </p>
            </MobileCollapse>
          </div>

          <div id="submit-payment" className="mt-12 scroll-mt-24">
            <p className="font-display text-xl text-gold">Step 3 · Tell us you&apos;ve sent it</p>
            <p className="mt-1 max-w-2xl text-sm text-stone leading-relaxed">
              Record your transaction reference below. Submitting it doesn&apos;t confirm payment — our team
              checks every transaction against the blockchain before it&apos;s marked confirmed.
            </p>
            <MobileCollapse label="Open the payment reference form">
              <div className="mt-4 max-w-xl">
                <CryptoPaymentPanel />
              </div>
            </MobileCollapse>
          </div>
        </Container>
      </section>

      <section id="payment-questions" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Questions" title="Payment questions, answered." />
          <div className="mt-8 max-w-3xl divide-y divide-line border-t hairline">
            {paymentFaqs.map((f) => (
              <details key={f.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ivory">
                  {f.question}
                  <span aria-hidden className="shrink-0 text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-stone leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t hairline bg-charcoal py-14 md:py-24">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Ready to start planning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us about the journey you have in mind — payment is arranged with your consultant once
            everything else is confirmed.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Plan Your Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
