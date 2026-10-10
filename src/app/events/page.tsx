import type { Metadata } from "next";
import { EventListingsPage } from "@/components/specialty/EventListingsPage";

export const metadata: Metadata = {
  title: "Events Worth Traveling For",
  description:
    "Upcoming and past major events around the world — sport, festivals, film, technology, design and culture — and journeys built around being there.",
};

export default function EventsPage() {
  return <EventListingsPage />;
}
