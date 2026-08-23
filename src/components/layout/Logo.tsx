import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 256 256"
        aria-hidden
        className="shrink-0 text-gold"
      >
        <path
          d="M128 52 L139 118 L205 128 L139 138 L128 204 L117 138 L51 128 L117 118 Z"
          fill="currentColor"
        />
        <circle cx="128" cy="128" r="8" fill="var(--color-ink)" />
        <circle cx="128" cy="128" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base md:text-lg tracking-[0.06em] uppercase text-ivory">
          World Bridge Meridian
        </span>
        <span className="mt-1.5 hidden sm:block eyebrow !text-[0.6rem] !tracking-[0.3em] text-stone group-hover:text-gold transition-colors">
          Bespoke Travel Group
        </span>
      </span>
    </Link>
  );
}
