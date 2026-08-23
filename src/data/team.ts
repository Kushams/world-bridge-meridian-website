import { TeamMember } from "./types";

export const team: TeamMember[] = [
  {
    slug: "earl-anderson",
    name: "Earl Anderson",
    title: "Founder & CEO",
    photo: "/images/earl-anderson.jpg",
    bio: [
      "Earl Anderson founded World Bridge Meridian in 2012 with a simple belief: travel should be about how you experience a destination, not just how you get there.",
      "Originally from Croatia, Earl brings a genuinely international perspective to the company — built from the start around bringing together destinations, accommodations, partners and itinerary planning around each individual traveler, rather than selling standardized packages.",
      "Earl continues to be closely involved in the company's client relationships and the standards it holds its journeys to.",
    ],
  },
  {
    slug: "justin-warkovsky",
    name: "Justin Warkovsky",
    title: "Chief Operating Officer",
    photo: "/images/justin-warkovsky.jpg",
    bio: [
      "Justin Warkovsky oversees World Bridge Meridian's day-to-day operations — the supplier relationships, logistics and internal standards that keep every journey running smoothly behind the scenes.",
      "Originally from Poland, Justin works closely with Earl to make sure the company's operations keep pace with its growth without losing the personal attention each journey is built on.",
    ],
  },
];

export function getTeamMember(slug: string) {
  return team.find((t) => t.slug === slug);
}
