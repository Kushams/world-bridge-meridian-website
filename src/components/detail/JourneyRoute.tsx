export interface RouteStop {
  city: string;
  nights: number;
}

export function JourneyRoute({ stops }: { stops: RouteStop[] }) {
  return (
    <ol>
      {stops.map((stop, i) => (
        <li key={stop.city}>
          <div className="flex items-center gap-4">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-hidden />
            <span className="font-display text-xl text-ivory">{stop.city}</span>
          </div>
          {i < stops.length - 1 ? (
            <div className="ml-[4px] flex items-center gap-4 py-1.5">
              <span className="h-8 w-px bg-line" aria-hidden />
              <span className="eyebrow !text-[0.65rem]">
                {stop.nights} {stop.nights === 1 ? "Night" : "Nights"}
              </span>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
