import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/components/cards/ArtListingCard";
import { eventCategoryLabels, type WorldEvent } from "@/data/events";

function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / msPerDay,
  );
}

type Tone = "now" | "soon" | "upcoming" | "past";

function statusFor(event: WorldEvent, today: string): { label: string; tone: Tone } {
  if (event.endDate < today) return { label: `Ended ${formatDate(event.endDate)}`, tone: "past" };
  if (event.startDate > today) {
    const days = daysBetween(today, event.startDate);
    return days <= 30
      ? { label: `Starts soon — ${formatDate(event.startDate)}`, tone: "soon" }
      : { label: `Starts ${formatDate(event.startDate)}`, tone: "upcoming" };
  }
  return { label: `Happening now — through ${formatDate(event.endDate)}`, tone: "now" };
}

const badgeTone: Record<Tone, string> = {
  now: "bg-gold text-ink",
  soon: "bg-gold text-ink",
  upcoming: "bg-ink/80 text-ivory backdrop-blur",
  past: "bg-charcoal/90 text-stone-dim backdrop-blur border border-line",
};

export function EventListingCard({ event, today }: { event: WorldEvent; today: string }) {
  const status = statusFor(event, today);
  const isPast = status.tone === "past";
  const sameDay = event.startDate === event.endDate;
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-card border hairline bg-charcoal ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="relative h-32 w-full shrink-0 md:h-48">
        <Image
          src={event.heroImage}
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
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="eyebrow mb-2">
          {eventCategoryLabels[event.category]} · {event.city}, {event.country}
        </p>
        <h3 className="font-display text-xl text-ivory leading-snug">{event.title}</h3>
        <p className="mt-2 text-sm text-stone-dim">
          {sameDay ? formatDate(event.startDate) : `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`}
        </p>
        <p className="mt-1 text-xs text-stone-dim">{event.venue}</p>
        <p className="mt-3 flex-1 text-sm text-stone leading-relaxed md:mt-4">{event.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t hairline pt-4 md:mt-6 md:pt-5">
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide text-stone-dim hover:text-gold transition-colors"
          >
            Verify on {event.sourceLabel} ↗
          </a>
          {!isPast ? (
            <div className="ml-auto">
              <Button
                href={`/travel-details-form?${new URLSearchParams({
                  event: `${event.title} — ${event.venue}, ${event.city}`,
                  type: event.category,
                  from: event.startDate,
                  to: event.endDate,
                }).toString()}`}
                variant="outline"
                size="md"
              >
                Plan This Trip
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
