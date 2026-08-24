"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, summary, [role='button'], .cursor-interactive";

export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 320, mass: 0.4 });
  const springY = useSpring(y, { damping: 28, stiffness: 320, mass: 0.4 });
  // Softer, slower spring than the dot so the glow trails just behind it —
  // reads as a light drifting after the cursor rather than snapping to it.
  const glowX = useSpring(x, { damping: 22, stiffness: 90, mass: 0.8 });
  const glowY = useSpring(y, { damping: 22, stiffness: 90, mass: 0.8 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(INTERACTIVE_SELECTOR);
      setHovering(!!target);
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", onOver);
    document.body.classList.add("custom-cursor-active");

    // Deferred so this mount-only capability check doesn't set state
    // synchronously inside the effect body.
    const raf = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [prefersReducedMotion, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[99] rounded-full"
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(200,166,104,0.55) 0%, rgba(200,166,104,0.18) 45%, rgba(200,166,104,0) 72%)",
        }}
        animate={{
          width: hovering ? 260 : 180,
          height: hovering ? 260 : 180,
          opacity: hovering ? 0.9 : 0.55,
        }}
        transition={{ type: "spring", damping: 24, stiffness: 80 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full bg-ivory mix-blend-difference"
        style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hovering ? 52 : 14, height: hovering ? 52 : 14 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
      />
    </>
  );
}
