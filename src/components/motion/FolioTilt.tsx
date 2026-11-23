"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * FOLIO tilt — a framed 3D piece resting on a floor shadow, moved by a spring.
 *
 * Built to the motion package's performance rules (MOTION-REFERENCES.md):
 * - the element's rect is cached on pointer-enter; pointermove does ZERO
 *   layout reads (it only divides the cached rect);
 * - one rAF loop per piece, transform-only writes, and the loop stops as
 *   soon as the spring settles — nothing runs while the card is at rest;
 * - touch devices (pointer: coarse) and prefers-reduced-motion never tilt.
 *
 * The piece carries two thin "edge" faces (right and bottom) in preserve-3d
 * so the frame reads as having real thickness while it tilts, and a soft
 * floor shadow underneath that deepens and drifts against the tilt.
 */
export function FolioTilt({
  children,
  className = "",
  maxTilt = 7,
  depth = 10,
  onHoverChange,
}: {
  children: ReactNode;
  className?: string;
  /** Peak rotation in degrees on each axis. */
  maxTilt?: number;
  /** Frame edge thickness in px. */
  depth?: number;
  onHoverChange?: (hovering: boolean) => void;
}) {
  const pieceRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const target = useRef({ rx: 0, ry: 0, lift: 0 });
  const current = useRef({ rx: 0, ry: 0, lift: 0 });
  const rafRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  const step = () => {
    rafRef.current = 0;
    const c = current.current;
    const t = target.current;
    // Exponential spring approach — fast in, soft settle, never linear.
    const k = 0.16;
    c.rx += (t.rx - c.rx) * k;
    c.ry += (t.ry - c.ry) * k;
    c.lift += (t.lift - c.lift) * k;
    const piece = pieceRef.current;
    if (piece) {
      piece.style.transform =
        `rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) ` +
        `translateY(${(-7 * c.lift).toFixed(2)}px) scale(${(1 + 0.02 * c.lift).toFixed(4)})`;
    }
    const shadow = shadowRef.current;
    if (shadow) {
      shadow.style.opacity = (0.3 + 0.32 * c.lift).toFixed(3);
      shadow.style.transform =
        `translate(${(-c.ry * 1.7).toFixed(1)}px, ${(4 + c.rx * 1.1).toFixed(1)}px) ` +
        `scaleX(${(1 - 0.07 * c.lift).toFixed(3)})`;
    }
    const settled =
      Math.abs(t.rx - c.rx) < 0.02 &&
      Math.abs(t.ry - c.ry) < 0.02 &&
      Math.abs(t.lift - c.lift) < 0.002;
    if (!settled) {
      rafRef.current = requestAnimationFrame(step);
    } else if (piece) {
      piece.style.willChange = "auto";
    }
  };

  const startLoop = () => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(step);
  };

  const handleEnter = () => {
    if (!enabledRef.current) return;
    const piece = pieceRef.current;
    if (!piece) return;
    rectRef.current = piece.getBoundingClientRect();
    piece.style.willChange = "transform";
    target.current.lift = 1;
    startLoop();
    onHoverChange?.(true);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!enabledRef.current) return;
    const rect = rectRef.current;
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    target.current.ry = (px - 0.5) * 2 * maxTilt;
    target.current.rx = (0.5 - py) * 2 * maxTilt;
    startLoop();
  };

  const handleLeave = () => {
    if (!enabledRef.current) return;
    target.current.rx = 0;
    target.current.ry = 0;
    target.current.lift = 0;
    startLoop();
    onHoverChange?.(false);
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {/* Floor shadow — a soft radial pool, no filter blur. */}
      <div
        ref={shadowRef}
        aria-hidden
        className="pointer-events-none absolute -bottom-4 left-[7%] right-[7%] h-7 rounded-[100%]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(43,30,10,0.55) 0%, rgba(43,30,10,0) 68%)",
          opacity: 0.3,
        }}
      />
      <div
        ref={pieceRef}
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Frame edges — visible only while the piece is tilted. */}
        <span
          aria-hidden
          className="absolute top-0 h-full rounded-r-sm"
          style={{
            width: depth,
            right: 0,
            transform: "rotateY(-90deg)",
            transformOrigin: "right center",
            background: "linear-gradient(90deg, #8a6a34 0%, #5d4520 55%, #3a2a10 100%)",
          }}
        />
        <span
          aria-hidden
          className="absolute left-0 w-full rounded-b-sm"
          style={{
            height: depth,
            bottom: 0,
            transform: "rotateX(90deg)",
            transformOrigin: "center bottom",
            background: "linear-gradient(180deg, #6d5327 0%, #33270f 100%)",
          }}
        />
        {children}
      </div>
    </div>
  );
}
