import Image from "next/image";
import Link from "next/link";
import { TravelPackage } from "@/data/types";
import { travelStyleLabel } from "@/data/travel-styles";
import { formatPrice } from "@/lib/format";

export function PackageCard({ pkg }: { pkg: TravelPackage }) {
  return (
    <Link href={`/travel-packages/${pkg.slug}`} className="group block">
      <div className="relative aspect-[16/11] overflow-hidden rounded-card bg-charcoal">
        <Image
          src={pkg.heroImage}
          alt={pkg.title}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
          className="img-zoom object-cover"
        />
        <div className="absolute left-4 top-4 rounded-full bg-ink/70 backdrop-blur px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-ivory">
          {pkg.duration}
        </div>
      </div>
      <div className="mt-4">
        <p className="eyebrow !text-[0.65rem] mb-1">
          {pkg.travelStyles.map(travelStyleLabel).join(" · ")}
        </p>
        <h3 className="font-display text-lg text-ivory group-hover:text-gold transition-colors">
          {pkg.title}
        </h3>
        <p className="mt-2 text-sm text-stone leading-relaxed line-clamp-2">
          {pkg.shortDescription}
        </p>
        <p className="mt-3 text-sm font-semibold text-ivory-dim">
          {formatPrice(pkg.indicativePricing[0])}
        </p>
      </div>
    </Link>
  );
}
