"use client";

import { useMemo, useState } from "react";
import { Review, TravelStyleSlug } from "@/data/types";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { travelStyleLabel } from "@/data/travel-styles";

const filterStyles: TravelStyleSlug[] = [
  "family",
  "romance",
  "luxury",
  "bespoke",
  "arts-culture",
  "cruise",
  "adventure",
  "wellness",
  "business",
];

export function ReviewsExplorer({ reviews }: { reviews: Review[] }) {
  const [style, setStyle] = useState<TravelStyleSlug | "all">("all");

  const available = useMemo(
    () => filterStyles.filter((s) => reviews.some((r) => r.tripType === s)),
    [reviews],
  );

  const filtered = useMemo(
    () => (style === "all" ? reviews : reviews.filter((r) => r.tripType === style)),
    [reviews, style],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStyle("all")}
          className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            style === "all" ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold hover:text-gold"
          }`}
        >
          All
        </button>
        {available.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              style === s ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold hover:text-gold"
            }`}
          >
            {travelStyleLabel(s)}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {filtered.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
