"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SwipeRow } from "@/components/ui/SwipeRow";
import { formatDate } from "@/components/cards/ArtListingCard";
import { EventListingCard } from "@/components/cards/EventListingCard";
import { worldEvents, eventCategoryLabels, EVENTS_LAST_VERIFIED, type EventCategory } from "@/data/events";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const regionOf: Record<string, string> = {
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",
  Brazil: "South America",
  "United Kingdom": "Europe",
  Ireland: "Europe",
  France: "Europe",
  Italy: "Europe",
  Spain: "Europe",
  Portugal: "Europe",
  Germany: "Europe",
  Monaco: "Europe",
  Belgium: "Europe",
  Switzerland: "Europe",
  China: "Asia-Pacific",
  "Hong Kong": "Asia-Pacific",
  Japan: "Asia-Pacific",
  Singapore: "Asia-Pacific",
  Australia: "Asia-Pacific",
  "United Arab Emirates": "Middle East & Africa",
  Qatar: "Middle East & Africa",
  "South Africa": "Middle East & Africa",
};
const regionOrder = ["North America", "South America", "Europe", "Middle East & Africa", "Asia-Pacific"];
const regionFor = (country: string) => regionOf[country] ?? "Europe";

export function EventListingsPage() {
  // Rendered against EVENTS_LAST_VERIFIED first so the HTML matches the server
  // render, then swapped to the visitor's own clock after mount so an event that
  // has finished moves into the archive without needing a redeploy.
  const [today, setToday] = useState(EVENTS_LAST_VERIFIED);
  const [category, setCategory] = useState<"all" | EventCategory>("all");
  const [region, setRegion] = useState<string>("all");
  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(worldEvents.map((e) => e.category))) as EventCategory[],
    [],
  );
  const regions = useMemo(
    () => regionOrder.filter((r) => worldEvents.some((e) => regionFor(e.country) === r)),
    [],
  );

  const filtered = worldEvents.filter(
    (e) => (category === "all" || e.category === category) && (region === "all" || regionFor(e.country) === region),
  );
  const live = filtered.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = filtered.filter((e) => e.endDate < today).sort((a, b) => b.endDate.localeCompare(a.endDate));

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
      active ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold hover:text-gold"
    }`;

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Events worth traveling for."
        description="The big moments on the world's calendar — sport, festivals, film, technology, design and culture — across every region, for clients who plan a journey around being there."
        image="https://images.unsplash.com/photo-1778914835544-4af67f7280df?w=1600&q=80&auto=format&fit=crop"
        imageAlt="A crowd at an outdoor festival with a ferris wheel"
      />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced and checked against each event&apos;s own website or organizer as of{" "}
            <span className="text-ivory">{formatDate(EVENTS_LAST_VERIFIED)}</span>. This page checks dates against your own
            device&apos;s clock each time it loads, so anything that has finished moves to the archive below rather than staying
            listed as current — every listing still links to the official source so you can confirm before you travel. We are
            not affiliated with any event, organizer or venue listed here; we simply help clients plan journeys around what&apos;s on.
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <div className="chip-row flex flex-wrap gap-3">
            <button type="button" onClick={() => setRegion("all")} className={chip(region === "all")}>
              All regions
            </button>
            {regions.map((r) => (
              <button key={r} type="button" onClick={() => setRegion(r)} className={chip(region === r)}>
                {r}
              </button>
            ))}
          </div>
          <div className="chip-row mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => setCategory("all")} className={chip(category === "all")}>
              All types
            </button>
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={chip(category === c)}>
                {eventCategoryLabels[c]}
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          {live.length > 0 ? (
            <SwipeRow className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((event) => (
                <EventListingCard key={event.slug} event={event} today={today} />
              ))}
            </SwipeRow>
          ) : (
            <p className="text-sm text-stone-dim">
              No upcoming events match that filter right now — try another region or type, or tell us what you&apos;re hoping to
              attend.
            </p>
          )}
        </Container>
      </section>

      {past.length > 0 ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <details className="group">
              <summary className="eyebrow cursor-pointer list-none select-none">
                Past Events ({past.length})
                <span className="ml-2 text-stone-dim normal-case tracking-normal group-open:hidden">— show</span>
                <span className="ml-2 hidden text-stone-dim normal-case tracking-normal group-open:inline">— hide</span>
              </summary>
              <SwipeRow className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event) => (
                  <EventListingCard key={event.slug} event={event} today={today} />
                ))}
              </SwipeRow>
            </details>
          </Container>
        </section>
      ) : null}

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Events worth traveling for.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us the event, the city and your dates and we&apos;ll build the travel around it — flights, stays, access and time
            for everything else the destination offers.
          </p>
          <div className="mt-8">
            <Button href="/travel-details-form" size="lg">
              Plan an Event Trip
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
