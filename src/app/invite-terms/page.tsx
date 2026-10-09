import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { themeImage } from "@/data/images";
import { inviteTerms, inviteTermsIntro } from "@/data/inviteTerms";

export const metadata: Metadata = {
  title: "Invite Program Terms",
  description: "The rules of the World Bridge Meridian Invite Program: who qualifies, how rewards are earned and how they expire.",
};

export default function InviteTermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Invite Program Terms"
        description="Who qualifies, how rewards are earned, and how they work."
        image={themeImage("luxuryResort", 3)}
        imageAlt="A resort pool at sunset"
        size="sm"
      />
      <section className="py-12 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-sm text-stone leading-relaxed">{inviteTermsIntro}</p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-stone leading-relaxed marker:text-gold">
            {inviteTerms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-stone-dim">
            See also the <Link href="/travel-credit-terms" className="underline underline-offset-4">Travel Credit terms</Link>,{" "}
            the <Link href="/terms" className="underline underline-offset-4">Terms &amp; Booking Conditions</Link> and the{" "}
            <Link href="/invite" className="underline underline-offset-4">Invite Program</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
