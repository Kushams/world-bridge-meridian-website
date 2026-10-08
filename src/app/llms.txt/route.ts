import { SITE_URL, company } from "@/data/company";
import { menuGroups } from "@/data/nav";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { journeyStories } from "@/data/journey-stories";
import { journal } from "@/data/journal";

export const dynamic = "force-static";

const link = (label: string, path: string, note?: string) =>
  `- [${label}](${SITE_URL}${path})${note ? `: ${note}` : ""}`;

export function GET() {
  const sections = [
    `# ${company.name}`,
    `> ${company.tagline}`,
    [
      `${company.name} is ${company.legalPositioning.toLowerCase()} founded in ${company.foundedYear} by ${company.founderName}.`,
      "Every journey is planned privately after a consultation; prices on the site are indicative starting prices confirmed after an availability check.",
      `Payment is by card, bank transfer or cryptocurrency (accepted since ${company.cryptoAcceptedSince}). There is no online checkout.`,
      `Contact: ${company.email}${company.phone ? `, ${company.phone}` : ""}.`,
    ].join(" "),
    "## Start here",
    [
      link("Plan your journey", "/plan-your-journey", "multi-step journey request form"),
      link("Contact", "/contact"),
      link("FAQs", "/faq", "how planning, pricing and payment work"),
      link("How we work", "/how-we-work"),
      link("Payment options", "/payments"),
    ].join("\n"),
    ...menuGroups.flatMap((group) => [
      `## ${group.heading}`,
      group.links.map((l) => link(l.label, l.href)).join("\n"),
    ]),
    "## Destinations",
    destinations.map((d) => link(`${d.name}, ${d.country}`, `/destinations/${d.slug}`, d.shortDescription)).join("\n"),
    "## Travel packages",
    packages.map((p) => link(p.title, `/travel-packages/${p.slug}`, `${p.duration}. ${p.shortDescription}`)).join("\n"),
    "## Journey stories",
    journeyStories.map((s) => link(s.title, `/journey-stories/${s.slug}`, `${s.subtitle}, ${s.duration}`)).join("\n"),
    "## Journal",
    journal.map((a) => link(a.title, `/journal/${a.slug}`, a.excerpt)).join("\n"),
  ];

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
