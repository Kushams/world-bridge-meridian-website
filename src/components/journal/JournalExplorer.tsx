"use client";

import { useMemo, useState } from "react";
import { JournalArticle } from "@/data/types";
import { JournalCard } from "@/components/cards/JournalCard";

export function JournalExplorer({ articles }: { articles: JournalArticle[] }) {
  const [category, setCategory] = useState<string>("all");
  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category))), [articles]);

  const filtered = useMemo(
    () => (category === "all" ? articles : articles.filter((a) => a.category === category)),
    [articles, category],
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

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((article) => (
          <JournalCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
