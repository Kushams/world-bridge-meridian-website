import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/company";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { cruises } from "@/data/cruises";
import { experiences } from "@/data/experiences";
import { journal } from "@/data/journal";
import { team } from "@/data/team";
import { journeyStories } from "@/data/journey-stories";

export const dynamic = "force-static";

const staticRoutes = [
  "",
  "/explore",
  "/destinations",
  "/travel-packages",
  "/cruises",
  "/experiences",
  "/current-journeys",
  "/bespoke",
  "/arts-culture",
  "/luxury-travel",
  "/family-travel",
  "/couples-travel",
  "/group-travel",
  "/corporate-travel",
  "/exhibitions",
  "/museums",
  "/art-fairs",
  "/calendar",
  "/journey-stories",
  "/private-journeys",
  "/institutional",
  "/compare",
  "/about",
  "/leadership",
  "/careers",
  "/partners",
  "/reviews",
  "/journal",
  "/faq",
  "/contact",
  "/plan-your-journey",
  "/payments",
  "/my-world-bridge",
  "/stays",
  "/privacy",
  "/terms",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
  }));

  for (const d of destinations) {
    entries.push({ url: `${SITE_URL}/destinations/${d.slug}`, lastModified: now });
  }
  for (const p of packages) {
    entries.push({ url: `${SITE_URL}/travel-packages/${p.slug}`, lastModified: now });
  }
  for (const c of cruises) {
    entries.push({ url: `${SITE_URL}/cruises/${c.slug}`, lastModified: now });
  }
  for (const e of experiences) {
    entries.push({ url: `${SITE_URL}/experiences/${e.slug}`, lastModified: now });
  }
  for (const a of journal) {
    entries.push({ url: `${SITE_URL}/journal/${a.slug}`, lastModified: new Date(a.date) });
  }
  for (const t of team) {
    entries.push({ url: `${SITE_URL}/leadership/${t.slug}`, lastModified: now });
  }
  for (const s of journeyStories) {
    entries.push({ url: `${SITE_URL}/journey-stories/${s.slug}`, lastModified: now });
  }

  return entries;
}
