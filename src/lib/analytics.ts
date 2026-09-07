"use client";

/**
 * Provider-agnostic funnel tracking. No analytics account is configured
 * yet, so this intentionally never loads a tracking script — it only calls
 * out to window.gtag / window.plausible if a future deploy adds one of
 * those. Until then every call is a documented no-op, which is safer than
 * silently doing nothing with no record of what should be tracked.
 */

export type AnalyticsEvent =
  | "homepage_view"
  | "destination_view"
  | "journey_view"
  | "cruise_view"
  | "holiday_collection_view"
  | "arts_culture_view"
  | "journey_wizard_started"
  | "journey_wizard_step_completed"
  | "journey_wizard_completed"
  | "journey_saved"
  | "journey_compared"
  | "consultation_requested"
  | "form_submitted"
  | "newsletter_signup"
  | "interest_filter_applied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", event, props ?? {});
  }
  if (typeof window.plausible === "function") {
    window.plausible(event, props ? { props } : undefined);
  }
}
