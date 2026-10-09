import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Gift Card Terms & Conditions",
  description: `The terms that apply to buying, giving, redeeming and using a ${company.name} gift card.`,
};

// Original wording written for World Bridge Meridian. Have a qualified lawyer
// review it (especially section 13, governing law: it says "an EU member state" until the exact country is chosen) before relying on it.
const sections: { title: string; body: string[] }[] = [
  {
    title: "1. About these terms",
    body: [
      `These terms apply to every ${company.name} gift card (a "gift card"). By buying, receiving, redeeming or using one, you agree to them. They sit alongside our general Terms & Booking Conditions, which apply when you book a journey.`,
    ],
  },
  {
    title: "2. Buying a gift card",
    body: [
      "You need a registered account to buy a gift card. Gift cards are sold in US dollars. Each card is worth at least US$500, and the total of one order must be between US$500 and US$25,000. For larger amounts, contact us.",
      "Gift cards are paid for in cryptocurrency, using one of the assets and networks listed on the order page and one of our published wallet addresses. You must send payment from a wallet you control, on the network you selected, and paste the transaction ID into the order form.",
      "An order is not complete until our team has verified your payment on the blockchain. If the amount we receive does not match your order, we will contact you before issuing anything. Network fees are charged by the network and exchange you use, and are not part of the gift card value.",
    ],
  },
  {
    title: "3. Delivery",
    body: [
      "Once your payment is verified, we email each gift card code to the recipient you named, or to you if you did not choose a recipient. If you send the card as a gift, we email you a receipt without the code.",
      "You are responsible for entering the right email addresses. We are not responsible for a card sent to an address that was entered incorrectly.",
    ],
  },
  {
    title: "4. Redeeming a gift card",
    body: [
      "To redeem a card, sign in to your My World Bridge account, open Travel Credits, and enter the code. The value is added to your account as Travel Credits (which never expire) and the code cannot be used again or moved to another account.",
      "Anyone who holds a code can redeem it, so keep it private. We apply the card to the first account that redeems it.",
    ],
  },
  {
    title: "5. Using your balance",
    body: [
      `Once redeemed, a gift card is held as Travel Credits and can be used toward journeys and services provided by ${company.name}. Your consultant applies the balance when you book and confirms the amount used and what remains. Every use appears in your account history.`,
      "You can use a card in more than one booking until the balance reaches zero. If a booking costs more than your balance, you pay the difference using one of our payment methods. If it costs less, the rest stays on the card.",
    ],
  },
  {
    title: "6. No expiry",
    body: ["Gift cards do not expire, and we do not charge fees that reduce the balance."],
  },
  {
    title: "7. Limits",
    body: [
      "A gift card is not a bank account, a deposit or electronic money. It earns no interest and cannot be reloaded, resold, transferred for value, or exchanged for cash, except where the law requires.",
    ],
  },
  {
    title: "8. Refunds",
    body: [
      "Once a gift card has been issued, it is not refundable and cannot be returned or exchanged, except where the law requires.",
      "If a booking that was paid for, wholly or partly, with a gift card is cancelled, the amount that was paid by gift card is returned to the card's balance, not paid out in cryptocurrency or cash. Any other part of the booking is handled under the cancellation terms that apply to it.",
      "Before a card is issued, contact us straight away if you made a mistake, such as a wrong amount or the wrong network. We will help where we reasonably can, but we cannot recover funds sent to a wrong address or on a wrong network that we do not control.",
    ],
  },
  {
    title: "9. Lost, stolen or misused codes",
    body: [
      "Treat a gift card code like cash. Risk of loss passes to the buyer or recipient when we email the code. We are not responsible if a code is lost, stolen, or used without permission.",
      "If you think a code has been compromised, contact us immediately. If we can verify that the card is yours and has not been used, we may, at our discretion, void it and issue a replacement.",
    ],
  },
  {
    title: "10. Fraud and compliance",
    body: [
      "We may refuse, delay or cancel an order, and void or refuse to honour a card, if we suspect fraud, money laundering, or a breach of these terms or of the law. We may ask you to confirm your identity or the source of funds, and we may close an account that is used to redeem or spend a fraudulently obtained card.",
    ],
  },
  {
    title: "11. Our responsibility",
    body: [
      "We take care to deliver and honour every gift card. To the extent the law allows, we give no warranty about a card beyond these terms, and our liability for a card that does not work is limited to replacing it or restoring its balance. Nothing here limits any right you have by law that cannot be limited.",
    ],
  },
  {
    title: "12. Changes",
    body: [
      "We may update these terms from time to time. A change applies to purchases made after we publish it. A card you already hold stays subject to the terms in force when it was bought, unless the law or a clear benefit to you requires otherwise.",
    ],
  },
  {
    title: "13. Governing law and disputes",
    body: [
      `These terms are governed by the laws of the European Union member state in which ${company.name} is established, and disputes go to the courts of that state. If you are a consumer, you also keep the mandatory consumer protections of the country where you live, and the right to bring a claim in its courts where the law gives you that right. Please contact us first with any question or complaint and we will work to resolve it.`,
    ],
  },
  {
    title: "14. Contact",
    body: [`Questions about a gift card: ${company.email}.`],
  },
];

export default function GiftCardTermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Gift Card Terms & Conditions" size="sm" />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-10 text-sm text-stone leading-relaxed">
            <p className="text-stone-dim">Last updated: October 2026</p>
            <nav aria-label="Sections" className="rounded-card border hairline p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ivory">In this page</p>
              <ol className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                {sections.map((s, i) => (
                  <li key={s.title}>
                    <a href={`#t${i + 1}`} className="underline-offset-4 hover:text-ivory hover:underline">{s.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            {sections.map((s, i) => (
              <div key={s.title} id={`t${i + 1}`} className="scroll-mt-28">
                <h2 className="mb-3 font-display text-xl text-ivory">{s.title}</h2>
                <div className="space-y-3">
                  {s.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
