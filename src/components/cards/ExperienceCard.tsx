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
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow !text-[0.65rem] mb-1">{experience.category}</p>
          <h3 className="font-display text-lg text-ivory leading-snug">
            {experience.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
