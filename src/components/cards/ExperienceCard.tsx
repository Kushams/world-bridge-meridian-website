import Image from "next/image";
import Link from "next/link";
import { Experience } from "@/data/types";

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link href={`/experiences/${experience.slug}`} className="group block tap-shrink">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-charcoal">
        <Image
          src={experience.heroImage}
          alt={experience.title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
          className="img-zoom object-cover"
        />
        <div className="scrim-card absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow eyebrow-on-photo !text-[0.65rem] mb-1">{experience.category}</p>
          <h3 className="font-display text-lg text-on-photo leading-snug">
            {experience.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
