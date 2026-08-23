import Image from "next/image";
import Link from "next/link";
import { JourneyStory } from "@/data/types";
import { travelStyleLabel } from "@/data/travel-styles";
import { TiltCard } from "@/components/motion/TiltCard";

export function JourneyStoryCard({ story }: { story: JourneyStory }) {
  return (
    <Link href={`/journey-stories/${story.slug}`} className="group block tap-shrink">
      <TiltCard className="relative aspect-[4/3] overflow-hidden rounded-card bg-charcoal">
        <Image
          src={story.heroImage}
          alt={story.title}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
          className="img-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow !text-[0.65rem] mb-1 text-gold">{story.subtitle}</p>
          <h3 className="font-display text-lg text-ivory">{story.title}</h3>
        </div>
      </TiltCard>
      <div className="mt-4">
        <p className="eyebrow !text-[0.65rem] mb-1">
          {story.duration} · {story.travelerType} ·{" "}
          {story.travelStyles.map(travelStyleLabel).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
