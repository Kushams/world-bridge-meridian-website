import Image from "next/image";
import { CalendarEntry } from "@/lib/calendarEntries";
import { Button } from "@/components/ui/Button";

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / msPerDay,
  );
}

export type CalendarEntryTone = "open" | "soon" | "upcoming" | "past";

export function statusForEntry(
  entry: CalendarEntry,
  today: string,
): { label: string; tone: CalendarEntryTone } {
  if (entry.endDate < today) {
    return { label: `Concluded ${formatDate(entry.endDate)}`, tone: "past" };
  }
  if (entry.startDate > today) {
    if (daysBetween(today, entry.startDate) <= 30) {
      return { label: `Begins ${formatDate(entry.startDate)}`, tone: "soon" };
    }
    return { label: `Begins ${formatDate(entry.startDate)}`, tone: "upcoming" };
  }
  return { label: `Underway — through ${formatDate(entry.endDate)}`, tone: "open" };
}

const badgeTone: Record<CalendarEntryTone, string> = {
  open: "bg-gold text-ink",
  soon: "bg-gold text-ink",
  upcoming: "bg-ink/80 text-ivory backdrop-blur",
  past: "bg-charcoal/90 text-stone-dim backdrop-blur border border-line",
};

export function CalendarEntryCard({ entry, today }: { entry: CalendarEntry; today: string }) {
  const status = statusForEntry(entry, today);
  const isPast = status.tone === "past";
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-card border hairline bg-charcoal ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="relative h-44 w-full shrink-0">
        <Image
          src={entry.heroImage}
          alt=""
          fill
          sizes="(min-width: 768px) 400px, 90vw"
          className={`object-cover ${isPast ? "grayscale" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTone[status.tone]}`}
        >
          {status.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow !text-[0.65rem] mb-2">
          {entry.venue} · {entry.city}, {entry.country}
        </p>
        <h3 className="font-display text-lg text-ivory leading-snug">{entry.title}</h3>
        <p className="mt-2 text-sm text-stone-dim">
          {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
        </p>
        <p className="mt-4 flex-1 text-sm text-stone leading-relaxed">{entry.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t hairline pt-5">
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide text-stone-dim hover:text-gold transition-colors"
          >
            Verify on {entry.sourceLabel} ↗
          </a>
          {!isPast ? (
            <div className="ml-auto">
              <Button href="/plan-your-journey" variant="outline" size="md">
                Plan This Trip
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
