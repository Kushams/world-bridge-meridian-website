"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArtListingCard, formatDate } from "@/components/cards/ArtListingCard";
import { artListings, LAST_VERIFIED, type ArtListing } from "@/data/exhibitions";
import { themeImage } from "@/data/images";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const categoryFilters: { value: ArtListing["category"] | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "gallery", label: "Gallery Exhibitions" },
  { value: "museum", label: "Museum Exhibitions" },
  { value: "fair", label: "Art Fairs" },
];

function monthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}

function monthLabel(iso: string) {
  return new Date(`${iso}-01T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function CalendarPage() {
  const [today, setToday] = useState(LAST_VERIFIED);
  const [category, setCategory] = useState<ArtListing["category"] | "all">("all");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const grouped = useMemo(() => {
    const upcoming = artListings
      .filter((l) => l.endDate >= today)
      .filter((l) => category === "all" || l.category === category)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Group by when a listing is next relevant, not when it originally opened —
    // an already-running show groups under the current month, not its (past)
    // opening month, so the calendar reads as "what's on from now" rather than
    // starting with a confusing past-dated section.
    const map = new Map<string, ArtListing[]>();
    for (const listing of upcoming) {
      const effectiveStart = listing.startDate > today ? listing.startDate : today;
      const key = monthKey(effectiveStart);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(listing);
    }
    return Array.from(map.entries());
  }, [today, category]);

  return (
    <>
      <PageHero
        eyebrow="Travel Calendar"
        title="What's on, and where."
        description="A month-by-month view of the gallery exhibitions, museum shows and art fairs we track — real, sourced dates, so you can plan travel around what's actually happening."
        image={themeImage("culturalHeritage", 8)}
        imageAlt="A white-walled museum gallery interior"
      />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced and checked against each institution&apos;s own website as of{" "}
            <span className="text-ivory">{formatDate(LAST_VERIFIED)}</span>. This calendar covers
            the art, culture and fair calendar we actively research and verify — it is not a
            complete global events calendar, and we don&apos;t list festival, sporting or fashion
            dates we haven&apos;t independently confirmed. Have a specific season or event in mind
            that isn&apos;t listed here? Tell us and we&apos;ll research it as part of your
            consultation.
          </div>
        </Container>
      </section>

      <section className="pb-10">
        <Container>
          <div className="flex flex-wrap gap-3">
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setCategory(f.value)}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  category === f.value
                    ? "border-gold text-gold"
                    : "border-line text-ivory-dim hover:border-gold"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          {grouped.length > 0 ? (
            <div className="space-y-16">
              {grouped.map(([key, listings]) => (
                <div key={key}>
                  <h2 className="font-display text-2xl md:text-3xl text-ivory mb-8">
                    {monthLabel(key)}
                  </h2>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                      <ArtListingCard key={listing.slug} listing={listing} today={today} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-dim">
              Nothing currently verified in this category — check back as we continue researching,
              or ask us directly.
            </p>
          )}
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Plan a journey around what&apos;s on.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us which show, fair or season you have in mind and we&apos;ll build the travel
            around it.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Design Your Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
