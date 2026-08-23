"use client";

import { useMemo, useState } from "react";
import { Experience } from "@/data/types";
import { ExperienceCard } from "@/components/cards/ExperienceCard";

export function ExperiencesExplorer({ experiences }: { experiences: Experience[] }) {
  const [category, setCategory] = useState<string>("all");
  const categories = useMemo(
    () => Array.from(new Set(experiences.map((e) => e.category))),
    [experiences],
  );

  const filtered = useMemo(
    () => (category === "all" ? experiences : experiences.filter((e) => e.category === category)),
    [experiences, category],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setCategory("all")}
          className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            category === "all" ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold hover:text-gold"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              category === c ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold hover:text-gold"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs text-stone-dim">
        {filtered.length} experience{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {filtered.map((experience) => (
          <ExperienceCard key={experience.slug} experience={experience} />
        ))}
      </div>
    </div>
  );
}
