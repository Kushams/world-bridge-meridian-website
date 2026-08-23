import type { Metadata } from "next";
import { CalendarPage } from "@/components/specialty/CalendarPage";

export const metadata: Metadata = {
  title: "Travel Calendar",
  description:
    "A month-by-month calendar of verified gallery exhibitions, museum shows and art fairs worldwide — plan travel around what's actually happening.",
};

export default function Page() {
  return <CalendarPage />;
}
