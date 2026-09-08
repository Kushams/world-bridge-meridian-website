import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Payment Options",
  description: `How payment works with ${company.name}, including cryptocurrency, card, bank transfer and regional payment partners.`,
};

export default function PaymentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Payments"
        title="How payment works."
        description="World Bridge Meridian doesn't run an online checkout. Every journey is priced and confirmed with you directly before any payment is arranged — by cryptocurrency, card, bank transfer, or a regional payment partner where local currency makes that the better option."
        image={themeImage("business", 1)}
        imageAlt="A workspace"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionHeading eyebrow="Cryptocurrency" title="We've accepted crypto since 2015." />
              <div className="mt-6 space-y-4 text-base text-stone leading-relaxed">
                <p>
                  World Bridge Meridian has accepted cryptocurrency payments since {company.cryptoAcceptedSince}{" "}
                  — well before it was common in travel. We currently support{" "}
                  {company.cryptoCurrencies.join(", ")}.
                </p>
                <p>
                  There is no public wallet address or QR code on this site, and there won&apos;t be. Once your
                  itinerary is finalized, your point of contact on our team sends payment instructions —
                  including the specific address and exact amount for your booking — directly to you, tied
                  to that booking. We&apos;ll never ask you to pay a figure or address you haven&apos;t
                  received that way.
                </p>
                <p className="text-ivory">
                  For your own protection: never send funds to a crypto address you find anywhere else
                  claiming to be us, and never to an address you weren&apos;t given directly through a
                  confirmed conversation about your specific journey. If anything about a payment request
                  seems off, contact us before sending anything.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">Card &amp; Bank Transfer</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  Also available, and confirmed with you directly during booking — the same way as
                  cryptocurrency, with details issued per booking rather than collected on the site.
                </p>
              </div>
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">Nothing Collected Here</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  This page is informational. No payment, card number, wallet address or crypto transaction
                  ever happens on worldbridgemeridian.group itself.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr] border-t hairline pt-16">
            <div>
              <SectionHeading
                eyebrow="Local Currency"
                title="Regional payment partners, where it makes sense."
              />
              <div className="mt-6 space-y-4 text-base text-stone leading-relaxed">
                <p>
                  In a number of markets, paying in US dollars or euros isn&apos;t practical for clients —
                  currency controls, banking restrictions or simply preferring to pay in their own
                  currency. For those bookings, we work with a small number of vetted regional payment
                  partners — local companies and, in some markets, individual licensed agents — who
                  collect payment in the local currency and remit it to World Bridge Meridian on the
                  client&apos;s behalf.
                </p>
                <p>
                  This is arranged per booking, never speculatively. If it applies to your journey, your
                  point of contact on our team will tell you directly, name the specific partner, and
                  confirm the amount and currency before anything changes hands.
                </p>
                <p className="text-ivory">
                  The same rule applies here as with cryptocurrency: we will never direct you to pay
                  anyone — a person or a company — that you weren&apos;t introduced to directly by your
                  World Bridge Meridian contact for your specific booking. If you&apos;re contacted by
                  anyone claiming to collect payment on our behalf outside of that, verify it with us
                  before paying.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">Not Every Booking</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  Most clients simply pay us directly by card, bank transfer or cryptocurrency. Regional
                  partners are used only where a client&apos;s local circumstances call for it.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Ready to start planning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us about the journey you have in mind — payment, in whichever form you prefer, is arranged
            once everything else is confirmed.
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
