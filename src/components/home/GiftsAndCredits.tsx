import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CASHBACK_TIERS, CREDIT_MIN, INVITE_REWARD, fmtUsd } from "@/lib/credits";

const cards = [
  {
    href: "/gift-cards",
    eyebrow: "Gift cards",
    title: "Give the gift of travel",
    body: `Send a World Bridge Meridian gift card from ${fmtUsd(CREDIT_MIN)}, paid in crypto and delivered by email. It never expires.`,
    cta: "Buy a gift card",
  },
  {
    href: "/travel-credits",
    eyebrow: "Travel Credits",
    title: "Buy today, travel tomorrow",
    body: `Top up your account with Travel Credits from ${fmtUsd(CREDIT_MIN)}. They never expire, and earn up to ${CASHBACK_TIERS[CASHBACK_TIERS.length - 1].pct}% cashback on big journeys.`,
    cta: "Buy Travel Credits",
  },
  {
    href: "/invite",
    eyebrow: "Invite & earn",
    title: `Give ${fmtUsd(INVITE_REWARD)}, get ${fmtUsd(INVITE_REWARD)}`,
    body: `Invite a friend. When they complete a journey of US$3,000 or more, you both receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.`,
    cta: "Get my invite link",
  },
];

/** Front-door to gift cards, Travel Credits, cashback and invites, so they are not hidden in the menu. */
export function GiftsAndCredits() {
  return (
    <section className="border-t hairline bg-charcoal py-14 md:py-24">
      <Container>
        <SectionHeading eyebrow="Gifts, Credits & Rewards" title="More ways to travel with us." />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.href} delay={i * 80}>
              <Link href={c.href} className="group flex h-full flex-col rounded-card border hairline bg-ink p-6 transition-colors hover:border-gold">
                <p className="eyebrow !text-[0.65rem]">{c.eyebrow}</p>
                <p className="mt-3 font-display text-xl text-ivory">{c.title}</p>
                <p className="mt-2 flex-1 text-sm text-stone leading-relaxed">{c.body}</p>
                <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-gold transition-colors group-hover:text-ivory">{c.cta} →</span>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-stone-dim">
          Your balance and invite rewards live in <Link href="/my-world-bridge#travel-credits" className="underline underline-offset-4">My World Bridge → Travel Credits</Link>.
        </p>
      </Container>
    </section>
  );
}
