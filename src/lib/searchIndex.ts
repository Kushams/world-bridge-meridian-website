import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { cruises } from "@/data/cruises";
import { experiences } from "@/data/experiences";
import { journal } from "@/data/journal";

export interface SearchItem {
  type: "Destination" | "Travel Package" | "Cruise" | "Experience" | "Journal";
  title: string;
  subtitle: string;
  href: string;
  image: string;
  keywords: string;
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const d of destinations) {
    items.push({
      type: "Destination",
      title: d.name,
      subtitle: `${d.country} · ${d.region}`,
      href: `/destinations/${d.slug}`,
      image: d.heroImage,
      keywords: `${d.name} ${d.country} ${d.region} ${d.shortDescription}`.toLowerCase(),
    });
  }

  for (const p of packages) {
    items.push({
      type: "Travel Package",
      title: p.title,
      subtitle: `${p.duration} · ${p.travelerType}`,
      href: `/travel-packages/${p.slug}`,
      image: p.heroImage,
      keywords: `${p.title} ${p.shortDescription} ${p.travelerType}`.toLowerCase(),
    });
  }

  for (const c of cruises) {
    items.push({
      type: "Cruise",
      title: c.title,
      subtitle: `${c.category} · ${c.duration}`,
      href: `/cruises/${c.slug}`,
      image: c.heroImage,
      keywords: `${c.title} ${c.category} ${c.departurePort}`.toLowerCase(),
    });
  }

  for (const e of experiences) {
    items.push({
      type: "Experience",
      title: e.title,
      subtitle: e.category,
      href: `/experiences/${e.slug}`,
      image: e.heroImage,
      keywords: `${e.title} ${e.category} ${e.shortDescription}`.toLowerCase(),
    });
  }

  for (const a of journal) {
    items.push({
      type: "Journal",
      title: a.title,
      subtitle: a.category,
      href: `/journal/${a.slug}`,
      image: a.heroImage,
      keywords: `${a.title} ${a.category} ${a.excerpt}`.toLowerCase(),
    });
  }

  return items;
}

export const searchIndex: SearchItem[] = buildIndex();

export function searchSite(query: string, limit = 40): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  return searchIndex
    .filter((item) => terms.every((term) => item.keywords.includes(term)))
    .slice(0, limit);
}
