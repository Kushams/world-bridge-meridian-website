"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArtListingCard, formatDate } from "@/components/cards/ArtListingCard";
import { listingsByCategory, LAST_VERIFIED, type ArtListing } from "@/data/exhibitions";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ArtListingsPage({
  eyebrow,
  title,
  intro,
  heroImage,
  heroImageAlt,
  category,
  ctaLabel,
  emptyNote,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  heroImage: string;
  heroImageAlt: string;
  category: ArtListing["category"];
  ctaLabel: string;
  emptyNote: string;
}) {
  // Rendered/hydrated against LAST_VERIFIED first (matches the server-rendered
  // HTML exactly, so there's no hydration mismatch), then swapped to the
  // visitor's own real clock right after mount — so a show that has actually
  // closed drops out of the live list and into the archive below without
  // needing this page rebuilt or redeployed.
  const [today, setToday] = useState(LAST_VERIFIED);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const allListings = listingsByCategory(category);
  const live = allListings.filter((l) => l.endDate >= today);
  const past = allListings
    .filter((l) => l.endDate < today)
    .sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={intro} image={heroImage} imageAlt={heroImageAlt} />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced and checked against each institution&apos;s own website as of{" "}
            <span className="text-ivory">{formatDate(LAST_VERIFIED)}</span>. This page checks dates
            against your own device&apos;s clock each time it loads, so anything past its closing date
            automatically moves to the archive below rather than staying listed as current — every
            listing still links directly to the official page so you can confirm before you travel. We
            are not affiliated with any gallery, museum or fair listed here; we simply help clients plan
            journeys around what&apos;s on.
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          {live.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((listing) => (
                <ArtListingCard key={listing.slug} listing={listing} today={today} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-dim">{emptyNote}</p>
          )}
        </Container>
      </section>

      {past.length > 0 ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <details className="group">
              <summary className="eyebrow cursor-pointer list-none select-none">
                Past Exhibitions ({past.length})
                <span className="ml-2 text-stone-dim normal-case tracking-normal group-open:hidden">
                  — show
                </span>
                <span className="ml-2 hidden text-stone-dim normal-case tracking-normal group-open:inline">
                  — hide
                </span>
              </summary>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((listing) => (
                  <ArtListingCard key={listing.slug} listing={listing} today={today} />
                ))}
              </div>
            </details>
          </Container>
        </section>
      ) : null}

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us which show, city or dates you have in mind and we&apos;ll build the travel around it —
            flights, stays and time for everything else the destination offers.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              {ctaLabel}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
