"use client";

import { useMemo, useState } from "react";
import { Destination, TravelStyleSlug } from "@/data/types";
import { travelStyles } from "@/data/travel-styles";
import { DestinationCard } from "@/components/cards/DestinationCard";

const regions = [
  "North America",
  "Europe",
  "Middle East & Africa",
  "Asia-Pacific",
  "Indian Ocean & Islands",
] as const;

export function DestinationsExplorer({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [style, setStyle] = useState<TravelStyleSlug | "all">("all");

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (region !== "all" && d.region !== region) return false;
      if (style !== "all" && !d.travelStyles.includes(style)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!d.name.toLowerCase().includes(q) && !d.country.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [destinations, region, style, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations or countries…"
          className="w-full rounded-full border border-line bg-transparent px-5 py-3 text-sm text-ivory placeholder:text-stone-dim focus:border-gold outline-none md:max-w-xs"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-full border border-line bg-ink px-5 py-3 text-sm text-ivory-dim outline-none focus:border-gold"
        >
          <option value="all">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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
        <p className="text-xs text-stone-dim md:ml-auto">
          {filtered.length} destination{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-stone">
          No destinations match those filters yet — try widening your search, or{" "}
          <a href="/plan-your-journey" className="text-gold hover:text-ivory transition-colors">
            tell us what you&apos;re imagining
          </a>
          .
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>
      )}
    </div>
  );
}
