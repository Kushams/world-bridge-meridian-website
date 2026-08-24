"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CalendarEntryCard, formatDate } from "@/components/cards/CalendarEntryCard";
import { buildCalendarEntries, calendarSectionOrder } from "@/lib/calendarEntries";
import { EVENTS_LAST_VERIFIED } from "@/data/events";
import { LAST_VERIFIED as EXHIBITIONS_LAST_VERIFIED } from "@/data/exhibitions";
import { themeImage } from "@/data/images";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const LAST_VERIFIED =
  EXHIBITIONS_LAST_VERIFIED > EVENTS_LAST_VERIFIED ? EXHIBITIONS_LAST_VERIFIED : EVENTS_LAST_VERIFIED;

const allEntries = buildCalendarEntries();

export function CalendarPage() {
  const [today, setToday] = useState(LAST_VERIFIED);
  const [section, setSection] = useState<string>("all");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(todayIso()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const { liveBySection, past } = useMemo(() => {
    const live = allEntries.filter((e) => e.endDate >= today);
    const pastEntries = allEntries
      .filter((e) => e.endDate < today)
      .sort((a, b) => b.endDate.localeCompare(a.endDate));

    const grouped = new Map<string, typeof live>();
    for (const entry of live) {
      if (!grouped.has(entry.sectionKey)) grouped.set(entry.sectionKey, []);
      grouped.get(entry.sectionKey)!.push(entry);
    }
    for (const [, list] of grouped) {
      list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    return { liveBySection: grouped, past: pastEntries };
  }, [today]);

  const sectionsToShow =
    section === "all" ? calendarSectionOrder : calendarSectionOrder.filter((s) => s.key === section);

  const sectionsWithContent = sectionsToShow.filter((s) => (liveBySection.get(s.key)?.length ?? 0) > 0);

  return (
    <>
      <PageHero
        eyebrow="Travel Calendar"
        title="What's on, and where."
        description="Real, sourced events worth planning a trip around — art and culture alongside major festivals, sporting events, conventions, film, fashion, design and industry gatherings worldwide."
        image={themeImage("culturalHeritage", 8)}
        imageAlt="A white-walled museum gallery interior"
      />

      <section className="py-10">
        <Container>
          <div className="rounded-card border hairline bg-charcoal p-5 text-sm text-stone-dim leading-relaxed">
            Sourced and checked against each event&apos;s own website or organizer as of{" "}
            <span className="text-ivory">{formatDate(LAST_VERIFIED)}</span>. Every listing links
            directly to its official source so you can confirm current details before you travel.
            We are not affiliated with any event, organizer or venue listed here — this is public
            information, offered because we can help plan travel around it.
          </div>
        </Container>
      </section>

      <section className="pb-10">
        <Container>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSection("all")}
              className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                section === "all" ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
              }`}
            >
              All Categories
            </button>
            {calendarSectionOrder.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSection(s.key)}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  section === s.key ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          {sectionsWithContent.length > 0 ? (
            <div className="space-y-16">
              {sectionsWithContent.map((s) => (
                <div key={s.key}>
                  <h2 className="font-display text-2xl md:text-3xl text-ivory mb-8">{s.label}</h2>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {liveBySection.get(s.key)!.map((entry) => (
                      <CalendarEntryCard key={entry.slug} entry={entry} today={today} />
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

      {past.length > 0 ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <details className="group">
              <summary className="eyebrow cursor-pointer list-none select-none">
                Past Events ({past.length})
                <span className="ml-2 text-stone-dim normal-case tracking-normal group-open:hidden">
                  — show
                </span>
                <span className="ml-2 hidden text-stone-dim normal-case tracking-normal group-open:inline">
                  — hide
                </span>
              </summary>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {past
                  .filter((entry) => section === "all" || entry.sectionKey === section)
                  .map((entry) => (
                    <CalendarEntryCard key={entry.slug} entry={entry} today={today} />
                  ))}
              </div>
            </details>
          </Container>
        </section>
      ) : null}

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Plan a journey around what&apos;s on.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Tell us which show, fair, festival or event you have in mind and we&apos;ll build the
            travel around it.
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
