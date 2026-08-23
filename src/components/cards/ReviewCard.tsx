import Image from "next/image";
import { Review } from "@/data/types";
import { travelStyleLabel } from "@/data/travel-styles";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-gold" role="text" aria-label={`${rating} out of 5 stars`}>
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
    <div className="flex h-full flex-col overflow-hidden rounded-card border hairline bg-charcoal">
      <div className="relative h-40 w-full shrink-0">
        <Image
          src={review.image}
          alt={`${review.destination} — the destination behind this review`}
          fill
          sizes="(min-width: 768px) 400px, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
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
    </div>
  );
}
