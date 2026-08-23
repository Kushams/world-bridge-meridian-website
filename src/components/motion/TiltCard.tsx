"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), springConfig);
  const scale = useSpring(1, springConfig);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function handleEnter() {
    scale.set(1.02);
  }

  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
    scale.set(1);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
