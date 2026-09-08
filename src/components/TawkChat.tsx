"use client";

import Script from "next/script";

/**
 * Live chat routed to our own team, via Tawk.to (free). Renders nothing
 * until the property/widget IDs are set — see .env.example.
 */
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

  if (!propertyId || !widgetId) return null;

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
      crossOrigin="anonymous"
    />
  );
}
