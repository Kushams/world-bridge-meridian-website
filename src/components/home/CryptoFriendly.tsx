import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cryptoPartnerExchanges, cryptoPartnerWallets } from "@/data/cryptoPartners";
import { company } from "@/data/company";

const points = [
  { t: "Pay in crypto", b: "Bitcoin, Ethereum, USDT, USDC and Solana, on the networks listed on our payments page." },
  { t: "Use any exchange or wallet", b: "Send from the account you already have. A wallet address and a transaction ID is all we need." },
  { t: "Verified by people", b: "Our team checks every payment on the blockchain and confirms with you before anything is booked." },
  { t: "Credits and cashback", b: "Buy Travel Credits with crypto and earn cashback on completed journeys." },
];

export function CryptoFriendly() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Crypto-Friendly Travel</p>
          <h2 className="font-display text-3xl text-ivory md:text-4xl">Book your journey with crypto.</h2>
          <p className="mt-4 text-sm text-stone leading-relaxed">
            {company.name} accepts cryptocurrency for bespoke journeys, gift cards and Travel Credits, with a human consultant from first message to final payment.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <Reveal key={p.t} delay={i * 60}>
              <div className="h-full rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">{p.t}</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">{p.b}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="eyebrow mb-4">Our crypto partners: exchanges &amp; wallets</p>
          <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {[...cryptoPartnerExchanges, ...cryptoPartnerWallets].map((n) => (
              <li key={n} className="rounded-full border hairline px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory-dim">
                {n}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-4 max-w-xl text-xs text-stone-dim">
            Pay from any of them, or from any other exchange or wallet you already use. Names belong to their respective owners.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/payments#cryptocurrency" className="text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors">How crypto payment works</Link>
            <Link href="/travel-credits" className="text-xs font-semibold uppercase tracking-wide text-gold hover:text-ivory transition-colors">Travel Credits</Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
