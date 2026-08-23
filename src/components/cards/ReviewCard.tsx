import { Review } from "@/data/types";
import { travelStyleLabel } from "@/data/travel-styles";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-gold" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-card border hairline bg-charcoal p-6 md:p-8 h-full flex flex-col">
      <Stars rating={review.rating} />
      <p className="mt-4 flex-1 font-display text-lg leading-relaxed text-ivory-dim">
        &ldquo;{review.quote}&rdquo;
      </p>
      <div className="mt-6 text-sm">
        <p className="font-semibold text-ivory">{review.name}</p>
        <p className="text-stone">
          {review.destination} · {travelStyleLabel(review.tripType)} · {review.year}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wide text-stone-dim">
          Sample testimonial
        </p>
      </div>
    </div>
  );
}
