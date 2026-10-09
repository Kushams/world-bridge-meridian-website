import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GiftCardPreview } from "@/components/gift-cards/GiftCardPreview";
import { CASHBACK_TIERS, CREDIT_MIN, INVITE_REWARD, fmtUsd } from "@/lib/credits";

const topCashback = CASHBACK_TIERS[CASHBACK_TIERS.length - 1].pct;

function Tile({ href, eyebrow, title, body, cta, art }: { href: string; eyebrow: string; title: string; body: string; cta: string; art: React.ReactNode }) {
  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-3xl border hairline bg-ink transition-all hover:-translate-y-1 hover:border-gold hover:shadow-xl">
      <div className="flex items-center justify-center bg-charcoal px-6 py-7">{art}</div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow !text-[0.65rem]">{eyebrow}</p>
        <p className="mt-2 font-display text-xl text-ivory">{title}</p>
        <p className="mt-2 flex-1 text-sm text-stone leading-relaxed">{body}</p>
        <span className="mt-5 text-xs font-semibold uppercase tracking-wide text-gold transition-colors group-hover:text-ivory">{cta} →</span>
      </div>
    </Link>
  );
}

/** Card-style entry points. The first two open the page at the buy section, where a visitor who is signed out is asked to sign in. */
export function GiftsAndCredits() {
  return (
    <section className="border-t hairline py-14 md:py-24">
      <Container>
        <SectionHeading eyebrow="Gift Cards & Credits" title="Give travel. Keep credit. Earn rewards." />
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Reveal>
            <Tile
              href="/gift-cards#buy"
              eyebrow="Gift cards"
              title="Give the gift of travel"
              body={`Send a World Bridge Meridian gift card from ${fmtUsd(CREDIT_MIN)}, paid in crypto and delivered by email. It never expires.`}
              cta="Get a gift card"
              art={<GiftCardPreview design="classic" amount="US$500+" small />}
            />
          </Reveal>
          <Reveal delay={80}>
            <Tile
              href="/travel-credits#buy"
              eyebrow="Travel Credits"
              title="Buy today, travel tomorrow"
              body={`Top up from ${fmtUsd(CREDIT_MIN)}. Credits never expire, and big journeys earn up to ${topCashback}% cashback.`}
              cta="Add credits"
              art={
                <div className="relative w-full max-w-[18rem] overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: "linear-gradient(135deg,#0f1c33 0%,#1d3a5c 55%,#8a5a22 100%)", aspectRatio: "1.6 / 1" }}>
                  <span aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#e6c27a]">Travel Credits</p>
                  <p className="mt-2 font-display text-3xl">1 credit = US$1</p>
                  <p className="mt-1 text-[0.55rem] uppercase tracking-[0.18em] text-white/70">Never expire</p>
                  <p className="absolute bottom-4 left-5 font-display text-sm">World Bridge Meridian</p>
                </div>
              }
            />
          </Reveal>
          <Reveal delay={160}>
            <Tile
              href="/invite"
              eyebrow="Invite & earn"
              title={`Give ${fmtUsd(INVITE_REWARD)}, get ${fmtUsd(INVITE_REWARD)}`}
              body={`Invite a friend. When they complete a journey of US$3,000 or more, you both receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.`}
              cta="Get my invite link"
              art={
                <div className="relative w-full max-w-[18rem] overflow-hidden rounded-2xl p-5 text-white shadow-lg" style={{ background: "linear-gradient(135deg,#3a1f4d 0%,#7a3b5e 55%,#d9895a 100%)", aspectRatio: "1.6 / 1" }}>
                  <span aria-hidden className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-white/10" />
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-[#ffd9a8]">Invite program</p>
                  <p className="mt-2 font-display text-3xl">{fmtUsd(INVITE_REWARD)} + {fmtUsd(INVITE_REWARD)}</p>
                  <p className="mt-1 text-[0.55rem] uppercase tracking-[0.18em] text-white/70">For you and your friend</p>
                </div>
              }
            />
          </Reveal>
        </div>
        <p className="mt-6 text-sm text-stone-dim">
          You need a free account to buy. Your wallet, gift cards and rewards live in <Link href="/my-world-bridge#travel-credits" className="underline underline-offset-4">your profile → Wallet</Link>.
        </p>
      </Container>
    </section>
  );
}
