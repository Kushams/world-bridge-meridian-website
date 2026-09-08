import type { Metadata } from "next";
import { FlightSearchPage } from "@/components/discovery/FlightSearchPage";

export const metadata: Metadata = {
  title: "Flight Search",
  description:
    "Search flights for your route and dates, then let World Bridge Meridian design the journey around them.",
};

export default function Page() {
  return <FlightSearchPage />;
}
