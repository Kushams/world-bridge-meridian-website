import Image from "next/image";
import Link from "next/link";
import { Destination } from "@/data/types";
import { CardEntrance } from "@/components/motion/CardEntrance";
import { FolioCardPhoto } from "@/components/motion/FolioCardPhoto";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group block tap-shrink"
    >
      <CardEntrance>
        <FolioCardPhoto
          className="aspect-[4/5] overflow-hidden rounded-card bg-charcoal"
          maxTilt={4.5}
          depth={8}
        >
          <Image
            src={destination.heroImage}
            alt={`${destination.name}, ${destination.country}`}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="img-zoom object-cover"
          />
          <div className="scrim-card absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 z-[6] p-5">
            <p className="eyebrow eyebrow-on-photo !text-[0.65rem] mb-1">{destination.country}</p>
            <h3 className="font-display text-xl text-on-photo">{destination.name}</h3>
          </div>
        </FolioCardPhoto>
        <p className="relative mt-3 text-sm text-stone leading-relaxed">
          {destination.shortDescription}
        </p>
      </CardEntrance>
    </Link>
  );
}
