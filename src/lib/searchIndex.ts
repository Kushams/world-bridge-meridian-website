import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { cruises } from "@/data/cruises";
import { experiences } from "@/data/experiences";
import { journal } from "@/data/journal";
import { artListings } from "@/data/exhibitions";
import { journeyStories } from "@/data/journey-stories";
import { worldEvents, eventCategoryLabels } from "@/data/events";
import { culturalAccessPrograms } from "@/data/culturalAccess";
import { sitePages } from "@/data/sitePages";
import { faqMain, faqGiftCards, faqCredits, faqInvite } from "@/data/pageFaqs";
import { stays } from "@/data/stays";
import { notableStays } from "@/data/topStays";
import { team } from "@/data/team";

const artHrefByCategory = { gallery: "/exhibitions", museum: "/museums", fair: "/art-fairs" } as const;
const artTypeByCategory = { gallery: "Exhibition", museum: "Museum Exhibition", fair: "Art Fair" } as const;

export interface SearchItem {
  type: "Page" | "Answer" | "Stay" | "Hotel" | "Team" | "Destination" | "Travel Package" | "Cruise" | "Experience" | "Journal" | "Exhibition" | "Museum Exhibition" | "Art Fair" | "Journey Story" | "Event" | "Cultural Access Program";
  title: string;
  subtitle: string;
  href: string;
  image: string | null;
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

  for (const s of journeyStories) {
    items.push({
      type: "Journey Story",
      title: s.title,
      subtitle: `${s.subtitle} · ${s.duration}`,
      href: `/journey-stories/${s.slug}`,
      image: s.heroImage,
      keywords: `${s.title} ${s.subtitle} ${s.whyThisJourney}`.toLowerCase(),
    });
  }

  for (const a of artListings) {
    items.push({
      type: artTypeByCategory[a.category],
      title: a.title,
      subtitle: `${a.venue} · ${a.city}`,
      href: artHrefByCategory[a.category],
      image: a.heroImage,
      keywords: `${a.title} ${a.venue} ${a.city} ${a.country}`.toLowerCase(),
    });
  }

  for (const e of worldEvents) {
    items.push({
      type: "Event",
      title: e.title,
      subtitle: `${eventCategoryLabels[e.category]} · ${e.city}`,
      href: "/calendar",
      image: e.heroImage,
      keywords: `${e.title} ${e.organizer} ${e.city} ${e.country} ${eventCategoryLabels[e.category]}`.toLowerCase(),
    });
  }

  for (const p of culturalAccessPrograms) {
    items.push({
      type: "Cultural Access Program",
      title: p.programName,
      subtitle: `${p.institution} · ${p.city}`,
      href: "/cultural-access",
      image: p.heroImage,
      keywords: `${p.programName} ${p.institution} ${p.city} ${p.country}`.toLowerCase(),
    });
  }

  for (const p of sitePages) {
    items.push({
      type: "Page",
      title: p.title,
      subtitle: p.description,
      href: p.href,
      image: null,
      keywords: `${p.title} ${p.description} ${p.keywords}`.toLowerCase(),
    });
  }

  const faqGroups: [string, { q: string; a: string }[]][] = [
    ["/faq", faqMain],
    ["/gift-cards#gift-card-questions", faqGiftCards],
    ["/travel-credits#credit-faq", faqCredits],
    ["/invite", faqInvite],
  ];
  for (const [href, list] of faqGroups) {
    for (const f of list) {
      items.push({
        type: "Answer",
        title: f.q,
        subtitle: f.a.length > 110 ? `${f.a.slice(0, 107)}…` : f.a,
        href,
        image: null,
        keywords: `${f.q} ${f.a}`.toLowerCase(),
      });
    }
  }

  for (const st of stays) {
    items.push({
      type: "Stay",
      title: st.name,
      subtitle: st.category,
      href: "/stays",
      image: st.heroImage,
      keywords: `${st.name} ${st.category} ${st.description} ${st.destinationSlug ?? ""}`.toLowerCase(),
    });
  }

  for (const h of notableStays) {
    items.push({
      type: "Hotel",
      title: h.name,
      subtitle: `${h.place} · ${h.kind}`,
      href: "/stays",
      image: h.heroImage,
      keywords: `${h.name} ${h.place} ${h.kind} ${h.continent} ${h.description}`.toLowerCase(),
    });
  }

  for (const m of team) {
    if (!m.name) continue;
    items.push({
      type: "Team",
      title: m.name,
      subtitle: `${m.title} · ${m.department}`,
      href: `/leadership/${m.slug}`,
      image: m.photo ?? null,
      keywords: `${m.name} ${m.title} ${m.department}`.toLowerCase(),
    });
  }

  return items;
}

export const searchIndex: SearchItem[] = buildIndex();

const STOP = new Set(["a", "an", "the", "in", "on", "to", "of", "for", "and", "or", "my", "i", "do", "is", "it", "how", "can", "what", "where", "with"]);
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
/** "cruises" matches "cruise", "gifts" matches "gift": compare words by their first letters when they are long. */
const stem = (w: string) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, "") : w);

export function searchSite(query: string, limit = 60): SearchItem[] {
  const words = norm(query).split(" ").filter(Boolean);
  const meaningful = words.filter((w) => !STOP.has(w));
  const terms = (meaningful.length > 0 ? meaningful : words).map(stem);
  if (terms.length === 0) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of searchIndex) {
    const hay = norm(item.keywords);
    if (!terms.every((t) => hay.includes(t))) continue;
    const title = norm(item.title);
    let score = 0;
    if (terms.every((t) => title.includes(t))) score += 10;
    if (title.startsWith(terms[0])) score += 4;
    if (item.type === "Page") score += 3;
    scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.item);
}
