import { TeamMember } from "./types";

export const team: TeamMember[] = [
  {
    slug: "earl-anderson",
    name: "Earl Anderson",
    title: "Founder & CEO",
    bio: [
      "Earl Anderson founded World Bridge Meridian in 2012 with a simple belief: travel should be about how you experience a destination, not just how you get there.",
      "Over more than a decade, he has built the company around organizing journeys — bringing together destinations, accommodations, partners and itinerary planning around each individual traveler, rather than selling standardized packages.",
      "Earl continues to be closely involved in the company's client relationships and the standards it holds its journeys to.",
    ],
  },
  {
    slug: "coo",
    name: null,
    title: "Chief Operating Officer",
    bio: null,
    placeholder: true,
  },
];

export function getTeamMember(slug: string) {
  return team.find((t) => t.slug === slug);
}
