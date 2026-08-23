"use client";

import { useMemo, useState } from "react";
import { Cruise } from "@/data/types";
import { CruiseCard } from "@/components/cards/CruiseCard";

export function CruisesExplorer({ cruises }: { cruises: Cruise[] }) {
  const [category, setCategory] = useState<string>("all");
  const categories = useMemo(() => Array.from(new Set(cruises.map((c) => c.category))), [cruises]);

  const filtered = useMemo(
    () => (category === "all" ? cruises : cruises.filter((c) => c.category === category)),
    [cruises, category],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            category === "all"
              ? "border-gold text-gold"
              : "border-line text-ivory-dim hover:border-gold hover:text-gold"
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              category === c
                ? "border-gold text-gold"
                : "border-line text-ivory-dim hover:border-gold hover:text-gold"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs text-stone-dim">
        {filtered.length} cruise{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((cruise) => (
          <CruiseCard key={cruise.slug} cruise={cruise} />
        ))}
      </div>
    </div>
  );
}
