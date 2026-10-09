import { ReactNode } from "react";
import { BlurTitle } from "@/components/motion/BlurTitle";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow ? (
        <p
          className={`eyebrow mb-4 flex items-center gap-3 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span aria-hidden className="h-px w-8 bg-gold/60" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="display-xl font-display text-[2.1rem] md:text-5xl lg:text-6xl leading-[1.04] tracking-[-0.02em] text-ivory text-balance-pretty">
        {typeof title === "string" ? <BlurTitle text={title} /> : title}
      </h2>
      {description ? (
        <p className="mt-5 text-base md:text-lg text-stone leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
