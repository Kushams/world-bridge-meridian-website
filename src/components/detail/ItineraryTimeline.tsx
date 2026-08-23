import { ItineraryDay } from "@/data/types";

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="space-y-8">
      {days.map((day, i) => (
        <li key={i} className="grid grid-cols-[auto_1fr] gap-6">
          <div className="flex flex-col items-center">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold text-xs font-semibold text-gold">
              {i + 1}
            </span>
            {i < days.length - 1 ? (
              <span className="mt-2 w-px flex-1 bg-line" aria-hidden />
            ) : null}
          </div>
          <div className="pb-2">
            <p className="eyebrow !text-[0.65rem] mb-1">{day.day}</p>
            <h3 className="font-display text-lg text-ivory">{day.title}</h3>
            <p className="mt-2 text-sm text-stone leading-relaxed">{day.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
