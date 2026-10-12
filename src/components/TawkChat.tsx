"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

interface TawkApi {
  onLoad?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
}
const api = () => (window as unknown as { Tawk_API?: TawkApi }).Tawk_API;

/**
 * Live chat routed to our own team, via Tawk.to (free). Renders nothing
 * until the property/widget IDs are set — see .env.example.
 *
 * The chat bubble is hidden on the staff page: staff reply from Tawk itself, and the bubble
 * would sit on top of the bottom tab bar there.
 */
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  const pathname = usePathname();
  const hidden = Boolean(pathname?.startsWith("/staff"));
  const hiddenRef = useRef(hidden);

  // If the widget loads while we're on a staff page, hide it as soon as it is ready.
  useEffect(() => {
    const w = window as unknown as { Tawk_API?: TawkApi };
    w.Tawk_API = w.Tawk_API ?? {};
    const prev = w.Tawk_API.onLoad;
    w.Tawk_API.onLoad = () => {
      prev?.();
      if (hiddenRef.current) api()?.hideWidget?.();
    };
  }, []);

  // Hide or show when moving between staff and public pages.
  useEffect(() => {
    hiddenRef.current = hidden;
    if (hidden) api()?.hideWidget?.();
    else api()?.showWidget?.();
  }, [hidden]);

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
