import type { Metadata } from "next";
import { CalendarPage } from "@/components/specialty/CalendarPage";
import { buildCalendarEntries } from "@/lib/calendarEntries";
import { SITE_URL } from "@/data/company";

export const metadata: Metadata = {
  title: "Travel Calendar",
  description:
    "A month-by-month calendar of verified gallery exhibitions, museum shows and art fairs worldwide — plan travel around what's actually happening.",
};

export default function Page() {
  const entries = buildCalendarEntries();

  const calendarJsonLd = {
    "@context": "https://schema.org",
    "@graph": entries.map((e) => ({
      "@type": "Event",
      name: e.title,
      description: e.description,
      image: e.heroImage,
      startDate: e.startDate,
      endDate: e.endDate,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: e.venue,
        address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: e.country },
      },
      url: `${SITE_URL}/calendar`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarJsonLd) }}
      />
      <CalendarPage />
    </>
  );
}
