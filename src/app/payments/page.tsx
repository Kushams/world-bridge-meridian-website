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

const sections = [
  { id: "how-it-works", label: "How it works" },
  { id: "bank-transfer", label: "Bank transfer" },
  { id: "cryptocurrency", label: "Cryptocurrency" },
  { id: "buy-crypto", label: "How to buy crypto" },
  { id: "send-safely", label: "Sending safely" },
  { id: "submit-payment", label: "Submit a payment" },
  { id: "payment-questions", label: "Questions" },
];

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
        description="There is no online checkout. Every journey is priced and confirmed with you first; your assigned consultant then arranges payment by bank transfer, through a regional intermediary in your local currency, or in cryptocurrency."
        image={themeImage("business", 1)}
        imageAlt="A workspace"
      />

      <nav aria-label="On this page" className="border-b hairline">
        <Container className="flex gap-2 overflow-x-auto py-4">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-sm text-ivory-dim transition-colors hover:border-gold hover:text-ivory"
            >
              {s.label}
            </a>
          ))}
        </Container>
      </nav>

      <Container className="pt-10">
        <a
          href="#buy-crypto"
          className="group flex flex-col gap-4 rounded-card border border-gold/50 bg-gold/5 p-6 transition-colors hover:border-gold sm:flex-row sm:items-center sm:justify-between md:p-8"
        >
          <span>
            <span className="block font-display text-xl text-ivory md:text-2xl">
              Paying with crypto for the first time?
            </span>
            <span className="mt-2 block text-sm text-stone leading-relaxed">
              Choose your country and we&apos;ll show you, in five simple steps, where to buy it and how
              to send it to us. No experience needed.
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-ivory px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition-opacity group-hover:opacity-90">
            Start here
          </span>
        </a>
      </Container>

      <section id="how-it-works" className="scroll-mt-24 py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="How It Works" title="Four steps, always in this order." />
          <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <li key={step.title} className="rounded-card border hairline p-6">
                <p className="font-display text-3xl text-gold">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 font-display text-lg text-ivory">{step.title}</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="bank-transfer" className="scroll-mt-24 border-t hairline py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="Bank Transfer" title="Arranged by your consultant." className="md:hidden" />
          <MobileCollapse label="Show bank transfer details" defaultOpen>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
            <div>
              <SectionHeading eyebrow="Bank Transfer" title="Arranged by your consultant." className="hidden md:block" />
              <div className="mt-6 space-y-4 text-base text-stone leading-relaxed">
                <p>
                  Every client is assigned a consultant, and bank transfers are arranged through them.
                  Once your journey is confirmed, your consultant issues the transfer details for your
                  specific booking — the amount, currency, beneficiary and reference to use. Bank
                  details are never published on this website.
                </p>
                <p>
                  We work with vetted payment intermediaries in many countries and regions. Where paying
                  in US dollars or euros isn&apos;t practical — because of currency controls, banking
                  restrictions, high international fees, or simply a preference for your own currency
                  — your consultant can arrange for you to pay a local intermediary in your local
                  currency, who then remits the payment to {company.name} on your behalf.
                </p>
                <p>
                  This is arranged per booking. If an intermediary applies to your journey, your
                  consultant will introduce them by name and confirm the amount and currency before
                  anything changes hands.
                </p>
                <p className="text-ivory">
                  For your protection: we will never ask you to pay a person, company or account you
                  weren&apos;t introduced to by your assigned consultant for your booking. If anyone
                  else contacts you claiming to collect payment for us, verify it at{" "}
                  <a href={`mailto:${company.email}`} className="underline underline-offset-4">
                    {company.email}
                  </a>{" "}
                  before paying.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">Details Issued Per Booking</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  Always use the reference your consultant gives you, so your transfer is matched to
                  your journey quickly.
                </p>
              </div>
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">Local-Currency Intermediaries</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  Available in many countries. Ask your consultant whether one is available where
                  you are.
                </p>
              </div>
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">No Card or Bank Details Collected</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  This site never asks for a card number or bank login. The only payment information
                  submitted here is a cryptocurrency transaction reference.
                </p>
              </div>
            </div>
          </div>
          </MobileCollapse>
        </Container>
      </section>

      <section id="cryptocurrency" className="scroll-mt-24 border-t hairline py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="Cryptocurrency" title={`Accepted since ${company.cryptoAcceptedSince}.`} />
          <MobileCollapse label="Show how to buy & send crypto">
          <div id="buy-crypto" className="mt-10 max-w-3xl scroll-mt-24">
            <CryptoCountryGuide />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
            <div>
              <div className="space-y-4 text-base text-stone leading-relaxed">
                <p>
                  {company.name} has accepted cryptocurrency since {company.cryptoAcceptedSince} — well
                  before it was common in travel. We currently accept {company.cryptoCurrencies.join(", ")}.
                </p>
                {addressesPublished ? (
                  <>
                    <p>
                      Amounts are never quoted here. Once your itinerary is finalized, your consultant
                      confirms the exact amount, asset and network for your booking. The wallet
                      addresses in the payment form below are our own, published so you can verify
                      them — they are the only addresses we ever collect cryptocurrency at.
                    </p>
                    <p className="text-ivory">
                      Check the address you are about to send to against the one on this page. If a
                      consultant, email, chat or social account gives you an address that doesn&apos;t
                      match, don&apos;t send to it — contact us first.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Amounts are never quoted here, and no address is published on this page at the
                      moment. Once your itinerary is finalized, your consultant sends payment
                      instructions — the exact amount, asset, network and address for your booking.
                    </p>
                    <p className="text-ivory">
                      Only ever send to an address you were given through a confirmed conversation about
                      your own journey. If anything about a payment request seems off, contact us first.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-card border hairline p-6">
              <p className="font-display text-lg text-ivory">Accepted Assets &amp; Networks</p>
              <ul className="mt-4 divide-y divide-line">
                {enabledCryptoPaymentOptions().map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="text-ivory">{o.asset}</span>
                    <span className="text-right text-stone">{o.network}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-stone-dim leading-relaxed">
                Send each asset only on the network listed. The wrong network can mean permanent loss.
              </p>
            </div>
          </div>
          </MobileCollapse>
        </Container>
      </section>

      <section id="send-safely" className="scroll-mt-24 border-t hairline bg-charcoal py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Sending Safely"
            title="Step by step, from purchase to confirmation."
            description="Whichever country you buy in, follow these steps so your payment arrives at the right address, on the right network."
          />
          <MobileCollapse label="Show the step-by-step">
          <ol className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
            {cryptoBuyingSteps.map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/60 font-display text-gold"
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg text-ivory">{step.title}</p>
                  <p className="mt-2 text-sm text-stone leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-12 max-w-3xl text-xs text-stone-dim leading-relaxed">
              Exchanges are listed as commonly used examples, not endorsements or partners of{" "}
              {company.name}. Availability, licensing and supported assets change — confirm the
              provider is licensed where you live. Not financial or tax advice. Guide last reviewed{" "}
              {cryptoGuideReviewed}. Country not listed, or can&apos;t buy crypto where you are? Ask your
              consultant about bank transfer or a regional intermediary.
            </p>
          </MobileCollapse>
        </Container>
      </section>

      <section id="submit-payment" className="scroll-mt-24 border-t hairline py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="Submit a Payment" title="Crypto payment reference submission." />
          <p className="mt-4 max-w-2xl text-sm text-stone leading-relaxed">
            {addressesPublished
              ? "If your consultant has already sent you payment instructions for a confirmed booking, send to the address below for the agreed asset and network, then record your transaction reference here."
              : "Once you have sent a payment for a confirmed booking, record your transaction reference here."}{" "}
            Submitting a hash does not confirm payment — our team verifies every transaction manually
            against the blockchain before it&apos;s marked confirmed.
          </p>
          <MobileCollapse label="Open the payment reference form">
            <div className="mt-6 max-w-xl">
              <CryptoPaymentPanel />
            </div>
          </MobileCollapse>
        </Container>
      </section>

      <section id="payment-questions" className="scroll-mt-24 border-t hairline py-16 md:py-24">
        <Container>
          <SectionHeading eyebrow="Questions" title="Payment questions, answered." />
          <div className="mt-10 max-w-3xl divide-y divide-line border-t hairline">
            {paymentFaqs.map((f) => (
              <details key={f.question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-ivory">
                  {f.question}
                  <span aria-hidden className="shrink-0 text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm text-stone leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
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
