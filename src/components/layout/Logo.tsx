import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/images/brand/emblem.png"
        alt=""
        aria-hidden
        width={348}
        height={312}
        priority
        className="h-9 w-auto shrink-0 md:h-10"
      />
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
