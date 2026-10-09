import Link from "next/link";
import Image from "next/image";
import { localImage } from "@/data/images";

export function Logo({
  className = "",
  size = "compact",
}: {
  className?: string;
  size?: "compact" | "large";
}) {
  const large = size === "large";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center ${large ? "gap-5" : "gap-2 sm:gap-3"} ${className}`}
    >
      <Image
        src={localImage("/images/brand/emblem.png")}
        alt=""
        aria-hidden
        width={348}
        height={312}
        priority
        className={large ? "h-14 w-auto shrink-0 sm:h-16 md:h-20" : "h-8 w-auto shrink-0 sm:h-9 md:h-10"}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={`font-display uppercase text-ivory ${
            large
              ? "text-lg leading-tight tracking-[0.04em] sm:whitespace-nowrap sm:text-xl md:text-2xl"
              : "max-w-[6rem] text-[0.8rem] leading-[1.15] sm:max-w-none tracking-[0.06em] sm:whitespace-nowrap sm:text-base sm:leading-tight md:text-lg"
          }`}
        >
          World Bridge Meridian
        </span>
        <span
          className={`flex items-center gap-2 text-gold-dim ${large ? "mt-3" : "mt-1.5"} ${large ? "" : "hidden sm:flex"}`}
          aria-hidden
        >
          <span className={`h-px flex-1 bg-gradient-to-r from-gold to-transparent ${large ? "max-w-8" : "max-w-5"}`} />
          <span className="h-1 w-1 rotate-45 bg-gold" />
          <span className={`h-px flex-1 bg-gradient-to-l from-gold to-transparent ${large ? "max-w-8" : "max-w-5"}`} />
        </span>
        <span
          className={`eyebrow whitespace-nowrap text-stone group-hover:text-gold transition-colors ${
            large ? "mt-3 !text-[0.7rem] !tracking-[0.22em]" : "mt-1.5 hidden sm:block !text-[0.6rem] !tracking-[0.3em]"
          }`}
        >
          Bespoke Travel Group
        </span>
      </span>
    </Link>
  );
}
