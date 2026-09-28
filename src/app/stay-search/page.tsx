import type { Metadata } from "next";
import { StaySearchPage } from "@/components/discovery/StaySearchPage";

export const metadata: Metadata = {
  title: "Stay Search",
  description:
    "Search accommodation for your destination and dates, then let World Bridge Meridian design the journey around it.",
};

export default function Page() {
  return <StaySearchPage />;
}
