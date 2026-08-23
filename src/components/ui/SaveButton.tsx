"use client";

import { useSavedItems, type SavedItemType } from "@/lib/savedItems";

export function SaveButton({
  type,
  slug,
  title,
  image,
  href,
  className = "",
}: {
  type: SavedItemType;
  slug: string;
  title: string;
  image: string;
  href: string;
  className?: string;
}) {
  const { isSaved, toggle } = useSavedItems();
  const saved = isSaved(type, slug);

  return (
    <button
      type="button"
      onClick={() => toggle({ type, slug, title, image, href })}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
        saved
          ? "border-gold text-gold"
          : "border-line text-ivory-dim hover:border-gold hover:text-gold"
      } ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-7.5-4.6-10-9.1C0.3 8.4 1.9 4.5 5.6 4c2-.3 3.9.6 5 2.2C11.7 4.6 13.6 3.7 15.6 4c3.7.5 5.3 4.4 3.6 7.9C19.5 16.4 12 21 12 21z" />
      </svg>
      {saved ? "Saved" : "Save Journey"}
    </button>
  );
}
