"use client";

import Script from "next/script";

/**
 * Google Analytics 4. Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID
 * is set — see .env.example. Once loaded, window.gtag becomes available,
 * which is exactly what src/lib/analytics.ts's track() already checks for,
 * so every tracked event starts flowing the moment this is configured —
 * no other code changes needed.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) return null;

  return (
    <>
      <Script
        id="ga4-lib"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
