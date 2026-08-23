"use client";

import { useMemo, useState } from "react";
import { TravelPackage, TravelStyleSlug } from "@/data/types";
import { travelStyles } from "@/data/travel-styles";
import { PackageCard } from "@/components/cards/PackageCard";

export function PackagesExplorer({ packages }: { packages: TravelPackage[] }) {
  const [style, setStyle] = useState<TravelStyleSlug | "all">("all");
  const [travelerType, setTravelerType] = useState<string>("all");

  const travelerTypes = useMemo(
    () => Array.from(new Set(packages.map((p) => p.travelerType))),
    [packages],
  );

  const filtered = useMemo(() => {
    return packages.filter((p) => {
      if (style !== "all" && !p.travelStyles.includes(style)) return false;
      if (travelerType !== "all" && p.travelerType !== travelerType) return false;
      return true;
    });
  }, [packages, style, travelerType]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as TravelStyleSlug | "all")}
          className="rounded-full border border-line bg-ink px-5 py-3 text-sm text-ivory-dim outline-none focus:border-gold"
        >
          <option value="all">All Travel Styles</option>
          {travelStyles.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={travelerType}
          onChange={(e) => setTravelerType(e.target.value)}
          className="rounded-full border border-line bg-ink px-5 py-3 text-sm text-ivory-dim outline-none focus:border-gold"
        >
          <option value="all">All Traveler Types</option>
          {travelerTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <p className="text-xs text-stone-dim md:ml-auto">
          {filtered.length} journey{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-stone">
          No journeys match those filters yet — try widening your search, or{" "}
          <a href="/plan-your-journey" className="text-gold hover:text-ivory transition-colors">
            tell us what you&apos;re imagining
          </a>
          .
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
