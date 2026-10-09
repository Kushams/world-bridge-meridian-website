import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CryptoCountryGuide } from "@/components/payments/CryptoCountryGuide";
import { cryptoGuideReviewed } from "@/data/cryptoBuyingGuide";

/** Same journey as the payments page, but for a purchase made on this site: no consultant step. */
const purchaseSteps = [
  { title: "Choose your amount first", body: "Pick the gift card or Travel Credits amount in the form above. The form then shows the exact amount to pay, the asset (for example USDC) and the network." },
  { title: "Open an account with a regulated exchange", body: "Choose an exchange that is licensed or registered where you live (pick your country above). Sign up with your legal name and complete identity verification, usually a photo ID and a selfie. It can take minutes or a few days, so do it early." },
  { title: "Add money in your local currency", body: "Deposit funds by bank transfer, debit card or a local payment method. Bank transfers are usually the cheapest; cards are faster but cost more." },
  { title: "Buy the cryptocurrency shown in the form", body: "Stablecoins (USDC or USDT) are the simplest because they track the US dollar. Buy the asset the form shows, and enough to cover the exchange's network fee on top." },
  { title: "Withdraw to our address on the right network", body: "Choose Send or Withdraw on your exchange, then copy our address from the form (or scan the QR code) and pick the same network the form shows. Check the first and last few characters. A wrong address or network can lose the money for good." },
  { title: "Send a small test first for large amounts", body: "For larger amounts, send a small test, check it arrived (your exchange shows this), then send the rest." },
  { title: "Paste your transaction ID and submit", body: "Copy the transaction ID (also called the hash or TxID) from your exchange, paste it into the form and submit. Our team verifies the payment on the blockchain, then emails your gift card code or adds your credits." },
];

/**
 * "New to crypto? How to buy and send it from your country", for people buying a gift card or
 * Travel Credits. Same content as the payments page: pick a country, then the seven steps.
 */
export function NewToCrypto({ what }: { what: string }) {
  return (
    <section id="new-to-crypto" className="scroll-mt-24 border-t hairline py-12 md:py-20">
      <Container>
        <SectionHeading
          eyebrow="New to crypto?"
          title="How to buy and send it, step by step."
          description={`Never paid with crypto? You can still ${what}. Pick your country for where to buy, then follow the steps.`}
        />
        <div className="mt-8 max-w-3xl">
          <CryptoCountryGuide />
        </div>
        <p className="mt-4 max-w-3xl text-sm text-stone-dim">
          For gift cards and credits you choose the amount yourself and our address appears in the form: there is no consultant step. The country tips above are general; follow the steps below.
        </p>
        <ol className="mt-10 max-w-3xl space-y-5">
          {purchaseSteps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-display text-2xl text-gold">{i + 1}</span>
              <div>
                <p className="font-display text-lg text-ivory">{step.title}</p>
                <p className="mt-1 text-sm text-stone leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-3xl text-xs text-stone-dim">
          Exchanges are examples, not endorsements. Availability and rules change by country: guide last reviewed {cryptoGuideReviewed}. Stuck? Email us and we&apos;ll help at any step.
        </p>
      </Container>
    </section>
  );
}
