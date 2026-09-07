"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Captures utm_* params (if present) into sessionStorage on every page load. Renders nothing. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
