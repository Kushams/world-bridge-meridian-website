import type { Metadata } from "next";
import { TravelByInterestPage } from "@/components/discovery/TravelByInterestPage";

export const metadata: Metadata = {
  title: "Travel by Interest",
  description:
    "Discover destinations by combining a region, journey type and the interests that matter most to you — art, food, adventure, wellness and more.",
};

export default function Page() {
  return <TravelByInterestPage />;
}
