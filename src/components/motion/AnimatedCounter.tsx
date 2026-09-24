"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();
  // Starts at the real value so the server-rendered HTML carries it for
  // crawlers, assistive technology and no-JS visitors; the count-up only
  // starts once the browser has taken over.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, duration, prefersReducedMotion]);

  const full = `${prefix}${value}${suffix}`;

  return (
    <span ref={ref} role="img" aria-label={full}>
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
}
