import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex flex-col leading-none ${className}`}
    >
      <span className="font-display text-lg md:text-xl tracking-[0.02em] text-ivory">
        World Bridge <span className="italic text-gold">Meridian</span>
      </span>
      <span className="mt-1 hidden sm:block eyebrow !text-[0.6rem] !tracking-[0.3em] text-stone group-hover:text-gold transition-colors">
        Independent Global Travel
      </span>
    </Link>
  );
}
