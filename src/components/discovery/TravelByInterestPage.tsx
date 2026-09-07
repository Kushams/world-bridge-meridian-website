"use client";

import { useMemo, useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { destinations } from "@/data/destinations";
import { interestTags, type InterestTag } from "@/data/interests";
import { travelStyles } from "@/data/travel-styles";
import { deriveInterestTags } from "@/lib/interestMatching";
import { themeImage } from "@/data/images";
import { TravelStyleSlug } from "@/data/types";
import { track } from "@/lib/analytics";

const regions = Array.from(new Set(destinations.map((d) => d.region)));

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

export function TravelByInterestPage() {
  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<TravelStyleSlug | null>(null);

  const tagged = useMemo(
    () => destinations.map((d) => ({ destination: d, tags: deriveInterestTags(d) })),
    [],
  );

  const filtered = tagged.filter(({ destination, tags }) => {
    if (selectedInterests.length > 0 && !selectedInterests.every((tag) => tags.includes(tag))) {
      return false;
    }
    if (selectedRegion && destination.region !== selectedRegion) return false;
    if (selectedStyle && !destination.travelStyles.includes(selectedStyle)) return false;
    return true;
  });

  function toggleInterest(tag: InterestTag) {
    setSelectedInterests((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      track("interest_filter_applied", { interests: next });
      return next;
    });
  }

  const activeSummary = [
    selectedRegion,
    selectedStyle && travelStyles.find((s) => s.slug === selectedStyle)?.label,
    ...selectedInterests,
  ].filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Travel by interest."
        description="Combine what you're drawn to — a region, a journey type, and the interests that matter most — to find destinations that fit. This is a starting point for a conversation, not a booking search."
        image={themeImage("culturalHeritage", 6)}
        imageAlt="A traveler exploring a historic city street"
      />

      <section className="py-10 border-b hairline">
        <Container>
          <p className="eyebrow mb-4">Region</p>
          <div className="flex flex-wrap gap-3">
            <Chip active={selectedRegion === null} onClick={() => setSelectedRegion(null)}>
              All Regions
            </Chip>
            {regions.map((r) => (
              <Chip key={r} active={selectedRegion === r} onClick={() => setSelectedRegion(r)}>
                {r}
              </Chip>
            ))}
          </div>

          <p className="eyebrow mb-4 mt-8">Journey Type</p>
          <div className="flex flex-wrap gap-3">
            <Chip active={selectedStyle === null} onClick={() => setSelectedStyle(null)}>
              Any
            </Chip>
            {travelStyles.map((s) => (
              <Chip
                key={s.slug}
                active={selectedStyle === s.slug}
                onClick={() => setSelectedStyle(selectedStyle === s.slug ? null : s.slug)}
              >
                {s.label}
              </Chip>
            ))}
          </div>

          <p className="eyebrow mb-4 mt-8">Interests</p>
          <div className="flex flex-wrap gap-3">
            {interestTags.map((tag) => (
              <Chip key={tag} active={selectedInterests.includes(tag)} onClick={() => toggleInterest(tag)}>
                {tag}
              </Chip>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-stone-dim">
              {activeSummary.length > 0 ? (
                <>
                  Showing destinations for{" "}
                  <span className="text-ivory">{activeSummary.join(" + ")}</span> — {filtered.length}{" "}
                  {filtered.length === 1 ? "match" : "matches"}
                </>
              ) : (
                `Showing all ${destinations.length} destinations — select a region, journey type or interest to narrow it down.`
              )}
            </p>
            {activeSummary.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedInterests([]);
                  setSelectedRegion(null);
                  setSelectedStyle(null);
                }}
                className="text-xs font-semibold uppercase tracking-wide text-stone-dim hover:text-gold transition-colors"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(({ destination }) => (
                <DestinationCard key={destination.slug} destination={destination} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-dim">
              Nothing matches that exact combination yet — tell us what you have in mind directly
              and we&apos;ll design around it.
            </p>
          )}
        </Container>
      </section>

      <section className="py-20 md:py-28 bg-charcoal border-t hairline">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl md:text-4xl text-ivory text-balance-pretty">
            Found something that fits?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Bring what you&apos;ve found here into a full journey consultation — we&apos;ll build the
            rest around it.
          </p>
          <div className="mt-8">
            <Button href="/plan-your-journey" size="lg">
              Design My Journey
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
