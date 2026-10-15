"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface SignaturePadHandle {
  /** PNG data URL of the drawing, or null if nothing was drawn. */
  toDataUrl: () => string | null;
  clear: () => void;
}

/** A white box to draw a signature in with a finger or mouse. */
export const SignaturePad = forwardRef<SignaturePadHandle, { label?: string; className?: string }>(function SignaturePad({ label = "Draw your signature", className = "h-36" }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);

  useImperativeHandle(ref, () => ({
    toDataUrl: () => (inked.current && canvasRef.current ? canvasRef.current.toDataURL("image/png") : null),
    clear: () => {
      const c = canvasRef.current;
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      inked.current = false;
    },
  }));

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-stone">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => {
            const c = canvasRef.current;
            c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
            inked.current = false;
          }}
          className="underline"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={180}
        aria-label={label}
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext("2d")!;
          const { x, y } = point(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d")!;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#1c1a17";
          const { x, y } = point(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          inked.current = true;
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
        className={`${className} w-full touch-none rounded-control border border-line bg-white`}
      />
    </div>
  );
});
