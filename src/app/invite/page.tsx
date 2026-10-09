import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqList } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { themeImage } from "@/data/images";
import { company } from "@/data/company";
import { InvitePanel } from "@/components/invite/InvitePanel";
import { INVITE_MIN_TRIP, INVITE_REWARD, INVITE_WINDOW_DAYS, PROMO_VALID_DAYS, fmtUsd } from "@/lib/credits";

export const metadata: Metadata = {
  title: `Invite Program — Give ${fmtUsd(INVITE_REWARD)}, Get ${fmtUsd(INVITE_REWARD)}`,
  description: `Invite a friend to ${company.name}. When they complete a journey of ${fmtUsd(INVITE_MIN_TRIP)} or more, you both receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.`,
};

const benefits = [
  { t: "A gift for your friend", b: `They get ${fmtUsd(INVITE_REWARD)} in Promo Credits toward their first journey with us.` },
  { t: "A reward for you", b: `You get ${fmtUsd(INVITE_REWARD)} in Promo Credits each time a friend you invite completes a qualifying journey.` },
  { t: "No limit", b: "Invite as many friends as you like. Every friend who qualifies earns you another reward." },
];

const steps = [
  { t: "Get your link", b: "Sign up or sign in, then copy your personal invite link from this page." },
  { t: "Share it", b: "Send it to friends and family who love to travel. They create an account through your link." },
  { t: "They travel", b: `Your friend books and completes a journey of ${fmtUsd(INVITE_MIN_TRIP)} or more.` },
  { t: "You both earn", b: `Our team adds ${fmtUsd(INVITE_REWARD)} in Promo Credits to each of your accounts.` },
];

const faqs = [
  { q: "What is the Invite Program?", a: `A way to introduce friends to ${company.name} and be rewarded when they travel. You each receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.` },
  { q: "Who can my friend be?", a: `Anyone with a new account, created in the last ${INVITE_WINDOW_DAYS} days through your link, who has not booked with us before.` },
  { q: "When do I receive my reward?", a: `After your friend's journey of ${fmtUsd(INVITE_MIN_TRIP)} or more has been completed and paid for. Our team adds the credits to both accounts and you will see them in My World Bridge.` },
  { q: "Do the rewards expire?", a: `Yes. They are Promo Credits and expire ${PROMO_VALID_DAYS} days after they are added. They can be used on any booking, up to 25% of its price.` },
  { q: "My friend already has an account.", a: "Sorry, the invite only works for new accounts. Your friend needs to sign up through your link." },
  { q: "Where do I see how my invites are going?", a: "On this page, once you are signed in: friends who joined, who has completed a journey, and what you have earned." },
];

export default function InvitePage() {
  return (
    <>
      <PageHero
        eyebrow="Invite Program"
        title={`Give ${fmtUsd(INVITE_REWARD)}, get ${fmtUsd(INVITE_REWARD)}.`}
        description={`Invite a friend to ${company.name}. When they complete a journey of ${fmtUsd(INVITE_MIN_TRIP)} or more, you both receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.`}
        image={themeImage("luxuryResort", 5)}
        imageAlt="Friends watching the sun set from a resort terrace"
        size="sm"
      />

      <section id="your-link" className="scroll-mt-24 py-12 md:py-16">
        <Container>
          <InvitePanel />
        </Container>
      </section>

      <section className="border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Benefits" title="Everyone wins." />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {benefits.map((c) => (
              <div key={c.t} className="rounded-card border hairline p-6">
                <p className="font-display text-lg text-ivory">{c.t}</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four simple steps." />
          <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.t} className="rounded-card border hairline p-6">
                <span className="font-display text-2xl text-gold">{i + 1}</span>
                <p className="mt-2 font-display text-lg text-ivory">{s.t}</p>
                <p className="mt-2 text-sm text-stone leading-relaxed">{s.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="invite-faq" className="scroll-mt-24 border-t hairline py-12 md:py-20">
        <Container>
          <SectionHeading eyebrow="Questions" title="Invite Program questions, answered." />
          <FaqList items={faqs} className="mt-8 max-w-3xl" />
          <p className="mt-8 text-sm text-stone-dim">
            Read the full <Link href="/invite-terms" className="underline underline-offset-4">Invite Program terms</Link>.
          </p>
        </Container>
      </section>

      <section className="border-t hairline bg-charcoal py-14 md:py-20">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl text-ivory md:text-4xl">Love to travel? Share the journey.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="#your-link" size="lg">Get my invite link</Button>
            <Button href="/travel-credits" variant="outline" size="lg">About Travel Credits</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
