import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { partners, partnersStatement } from "@/data/partners";
import { unsplashPhoto } from "@/data/images";
import { cryptoPartnerExchanges, cryptoPartnerWallets } from "@/data/cryptoPartners";
import { PartnerChip } from "@/components/ui/PartnerChip";
import { SwipeRow } from "@/components/ui/SwipeRow";

export const metadata: Metadata = {
  title: "Partners",
  description: "Selected hospitality and travel partners working with World Bridge Meridian.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Partners"
        description={partnersStatement}
        image={unsplashPhoto("1758518729240-7162d07427b8")}
        imageAlt="A city street"
      />
      <section className="py-16 md:py-24">
        <Container>
          <p className="max-w-2xl text-sm text-stone-dim leading-relaxed">
            We work with a network of hospitality and travel partners across the destinations we
            organize journeys to. Until specific named partnerships are confirmed and ready to
            publish, we describe our network by category rather than by name.
          </p>
          <SwipeRow className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner) => (
              <div key={partner.category} className="border-t hairline pt-6">
                <h3 className="font-display text-lg text-ivory">{partner.category}</h3>
                <p className="mt-3 text-sm text-stone leading-relaxed">{partner.description}</p>
              </div>
            ))}
          </SwipeRow>
        </Container>
      </section>

      <section className="border-t hairline py-16 md:py-24">
        <Container>
          <p className="eyebrow mb-3">Crypto Partners</p>
          <h2 className="font-display text-2xl text-ivory md:text-3xl">Exchanges &amp; wallets we work with</h2>
          <p className="mt-3 max-w-2xl text-sm text-stone leading-relaxed">
            We accept cryptocurrency for journeys, gift cards and Travel Credits, and work with the exchanges and wallets our customers already use.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {[{ t: "Exchanges", l: cryptoPartnerExchanges }, { t: "Wallets", l: cryptoPartnerWallets }].map((g) => (
              <div key={g.t}>
                <h3 className="font-display text-lg text-ivory">{g.t}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.l.map((p) => (
                    <li key={p.name} className="marquee-logo"><PartnerChip partner={p} /></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
