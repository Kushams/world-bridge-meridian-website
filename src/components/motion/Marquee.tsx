/**
 * A slow, endless strip of names. Pauses when hovered or focused; static (wrapped) for visitors who
 * prefer reduced motion. Idea adapted from Arc's logo marquee (MIT), see docs/THIRD_PARTY.md.
 */
import type { ReactNode } from "react";

export function Marquee({ items, reverse = false, seconds = 40, label }: { items: (string | { key: string; node: ReactNode })[]; reverse?: boolean; seconds?: number; label: string }) {
  const row = (hidden: boolean) => (
    <ul className="marquee-list" aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label}>
      {items.map((n, i) =>
        typeof n === "string" ? (
          <li key={`${n}-${i}`} className="marquee-item">{n}</li>
        ) : (
          <li key={`${n.key}-${i}`} className="marquee-logo">{n.node}</li>
        ),
      )}
    </ul>
  );
  return (
    <div className="marquee" style={{ ["--marquee-seconds" as string]: `${seconds}s` }}>
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
