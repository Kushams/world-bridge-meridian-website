"use client";

/**
 * Campaign attribution: captures utm_* params on first landing and persists
 * them in sessionStorage so they survive navigation between pages up to and
 * including a Journey Wizard submission — without needing a backend or a
 * cookie-consent-gated tracker to do it.
 */

const STORAGE_KEY = "wbm_attribution";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landingPage: string;
}

function readStored(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * Call once per page load (e.g. in a layout-level effect). If UTM params
 * are present in the URL, they overwrite whatever was stored — a new
 * campaign link always wins. Otherwise, the first-touch values already in
 * storage are left alone.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const hasUtm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].some(
    (k) => params.has(k),
  );

  if (!hasUtm && readStored()) return;

  const attribution: Attribution = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    landingPage: readStored()?.landingPage ?? window.location.pathname,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — attribution is
    // simply not persisted for this visit.
  }
}

export function getAttribution(): Attribution {
  return (
    readStored() ?? {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      landingPage: typeof window !== "undefined" ? window.location.pathname : "",
    }
  );
}
