import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/data/types";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-charcoal">
        <Image
          src={destination.heroImage}
          alt={`${destination.name}, ${destination.country}`}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="img-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow !text-[0.65rem] mb-1">{destination.country}</p>
          <h3 className="font-display text-xl text-ivory">{destination.name}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm text-stone leading-relaxed">
        {destination.shortDescription}
      </p>
    </Link>
  );
}
