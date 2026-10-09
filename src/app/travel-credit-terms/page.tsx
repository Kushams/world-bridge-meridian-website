import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { themeImage } from "@/data/images";
import { creditTerms, creditTermsIntro } from "@/data/creditTerms";

export const metadata: Metadata = {
  title: "Travel Credit & Promo Credit Terms",
  description: "The rules for World Bridge Meridian Travel Credits and Promo Credits: who can hold them, how they are used, and when they expire.",
};

export default function TravelCreditTermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Travel Credit & Promo Credit Terms"
        description="How Travel Credits and Promo Credits are bought, used and expire."
        image={themeImage("luxuryResort", 4)}
        imageAlt="A resort pool at sunset"
        size="sm"
      />
      <section className="py-12 md:py-20">
        <Container className="max-w-3xl">
          <p className="text-sm text-stone leading-relaxed">{creditTermsIntro}</p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-stone leading-relaxed marker:text-gold">
            {creditTerms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-stone-dim">
            See also the <Link href="/terms" className="underline underline-offset-4">Terms &amp; Booking Conditions</Link>, the{" "}
            <Link href="/gift-card-terms" className="underline underline-offset-4">gift card terms</Link>, the{" "}
            <Link href="/invite-terms" className="underline underline-offset-4">Invite Program terms</Link> and{" "}
            <Link href="/travel-credits" className="underline underline-offset-4">Travel Credits</Link>.
          </p>
        </Container>
      </section>
    </>
  );
}
