import Image from "next/image";
import { CulturalAccessProgram } from "@/data/culturalAccess";
import { Button } from "@/components/ui/Button";

const categoryLabel: Record<CulturalAccessProgram["category"], string> = {
  museum: "Museum",
  "opera-ballet": "Opera & Ballet",
};

export function CulturalAccessCard({ program }: { program: CulturalAccessProgram }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border hairline bg-charcoal">
      <div className="relative h-48 w-full shrink-0">
        <Image
          src={program.heroImage}
          alt="Cultural institution interior"
          fill
          sizes="(min-width: 768px) 400px, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ivory backdrop-blur">
          {categoryLabel[program.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow mb-2">
          {program.institution} · {program.city}, {program.country}
        </p>
        <h3 className="font-display text-xl text-ivory leading-snug">{program.programName}</h3>
        <p className="mt-4 flex-1 text-sm text-stone leading-relaxed">{program.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t hairline pt-5">
          <a
            href={program.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide text-stone-dim hover:text-gold transition-colors"
          >
            View on {program.sourceLabel} ↗
          </a>
          <div className="ml-auto">
            <Button href="/plan-your-journey" variant="outline" size="md">
              Plan Around This
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
