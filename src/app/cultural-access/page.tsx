import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CulturalAccessCard } from "@/components/cards/CulturalAccessCard";
import {
  culturalAccessPrograms,
  culturalAccessByCategory,
  CULTURAL_ACCESS_LAST_VERIFIED,
} from "@/data/culturalAccess";
import { themeImage } from "@/data/images";

export const metadata: Metadata = {
  title: "Cultural Access Programs",
  description:
    "Real membership and patron programs run directly by leading museums, opera houses and ballet companies — and journeys built around joining or attending one.",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function CulturalAccessPage() {
  const museumPrograms = culturalAccessByCategory("museum");
  const operaPrograms = culturalAccessByCategory("opera-ballet");

  return (
    <>
      <PageHero
        eyebrow="Arts & Culture"
        title="Closer to the institutions you love."
        description="Most major museums and opera houses run their own membership and patron programs — private views, curator-led tours, backstage access, priority booking. Here's a starting list of real ones, and we can build travel around joining or attending."
        image={themeImage("culturalHeritage", 8)}
        imageAlt="A museum gallery interior"
      />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced from each institution&apos;s own membership pages as of{" "}
            <span className="text-ivory">{formatDate(CULTURAL_ACCESS_LAST_VERIFIED)}</span>. We are not
            affiliated with, and do not sell memberships on behalf of, any organization listed here — these
            are independent programs run directly by the museums, opera houses and ballet companies
            themselves. Fees, tiers and benefits change; every listing links to the institution&apos;s own page
            so you can confirm current terms before joining. What we can help with is the travel around
            it — timing a trip to a members&apos; opening, a season premiere, or simply a city visit that fits
            around when you&apos;re eligible to use it.
          </div>
        </Container>
      </section>

      {museumPrograms.length > 0 ? (
        <section className="pb-16 md:pb-20">
          <Container>
            <p className="eyebrow mb-6">Museum Membership & Patron Programs</p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {museumPrograms.map((program) => (
                <CulturalAccessCard key={program.slug} program={program} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {operaPrograms.length > 0 ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <p className="eyebrow mb-6">Opera & Ballet Patron Programs</p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {operaPrograms.map((program) => (
                <CulturalAccessCard key={program.slug} program={program} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {culturalAccessPrograms.length === 0 ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <p className="text-sm text-stone-dim">
              No programs currently listed — tell us which institution you have in mind.
            </p>
          </Container>
        </section>
      ) : null}

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Already a member somewhere? Let&apos;s build the trip around it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            A members&apos; private view, a season premiere, a curator-led tour — tell us the program, the
            institution and the dates, and we&apos;ll build flights, stays and the rest of the trip around it.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Plan a Cultural Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
