import { ReactNode } from "react";

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
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.1] text-ivory text-balance-pretty">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base md:text-lg text-stone leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
