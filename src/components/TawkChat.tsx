"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

interface TawkApi {
  onLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatMessageStaff?: () => void;
  maximize?: () => void;
}
const api = () => (window as unknown as { Tawk_API?: TawkApi }).Tawk_API;

const SIZE = 56;
const EDGE = 12;
const KEY = "wbm-chat-pos";

/** Position as a share of the free space, so it survives resizing and rotating: fx 0 = left edge, 1 = right edge. */
type Pos = { fx: number; fy: number };
const DEFAULT_POS: Pos = { fx: 1, fy: 0.86 };

const readPos = (): Pos => {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null") as Pos | null;
    if (p && typeof p.fx === "number" && typeof p.fy === "number") return { fx: Math.min(1, Math.max(0, p.fx)), fy: Math.min(1, Math.max(0, p.fy)) };
  } catch {
    // storage unavailable: use the default
  }
  return DEFAULT_POS;
};

/**
 * Live chat routed to our own team, via Tawk.to (free). Renders nothing until the property/widget IDs are set
 * (see .env.example).
 *
 * Tawk's own round bubble is hidden and replaced by our button, which can be dragged anywhere on the screen
 * (and remembers where you left it). Tapping it opens the same Tawk chat window. The button is not shown on the
 * staff page: staff reply from Tawk itself, and it would sit over the bottom tab bar.
 */
export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;
  const pathname = usePathname();
  const onStaffPage = Boolean(pathname?.startsWith("/staff"));

  const [pos, setPos] = useState<Pos>(DEFAULT_POS);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 390, h: 800 });
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  // Track the viewport so fractions map to pixels.
  useEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const t = setTimeout(() => {
      measure();
      setPos(readPos());
      setMounted(true);
    }, 0);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Listen to the chat window so our button hides while it is open and shows a dot for new replies.
  useEffect(() => {
    const w = window as unknown as { Tawk_API?: TawkApi };
    w.Tawk_API = w.Tawk_API ?? {};
    const t = w.Tawk_API;
    const prev = { max: t.onChatMaximized, min: t.onChatMinimized, msg: t.onChatMessageStaff };
    t.onChatMaximized = () => {
      prev.max?.();
      setOpen(true);
      setUnread(false);
    };
    t.onChatMinimized = () => {
      prev.min?.();
      setOpen(false);
    };
    t.onChatMessageStaff = () => {
      prev.msg?.();
      setUnread(true);
    };
  }, []);

  const maxX = Math.max(EDGE, size.w - SIZE - EDGE);
  const maxY = Math.max(EDGE, size.h - SIZE - EDGE);
  const left = EDGE + pos.fx * (maxX - EDGE);
  const top = EDGE + pos.fy * (maxY - EDGE);

  const openChat = useCallback(() => {
    const t = api();
    if (t?.maximize) t.maximize();
    else if (t) t.onLoad = () => api()?.maximize?.();
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: left, oy: top, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setDragging(true);
    const nx = Math.min(maxX, Math.max(EDGE, d.ox + dx));
    const ny = Math.min(maxY, Math.max(EDGE, d.oy + dy));
    setPos({ fx: (nx - EDGE) / Math.max(1, maxX - EDGE), fy: (ny - EDGE) / Math.max(1, maxY - EDGE) });
  }
  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || d.id !== e.pointerId || !d.moved) return;
    // Let go: settle against the nearest side edge so it never sits half over the page content.
    justDragged.current = true;
    window.setTimeout(() => (justDragged.current = false), 80);
    setPos((p) => {
      const next = { fx: p.fx < 0.5 ? 0 : 1, fy: p.fy };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // storage unavailable: position just isn't remembered
      }
      return next;
    });
  }

  // Staff answer from Tawk itself, so its own bubble must never show over the staff pages.
  useEffect(() => {
    const w = window as unknown as { Tawk_API?: TawkApi & { hideWidget?: () => void; showWidget?: () => void } };
    const t = (w.Tawk_API = w.Tawk_API ?? {});
    const apply = () => (onStaffPage ? t.hideWidget?.() : t.showWidget?.());
    apply();
    const prevLoad = t.onLoad;
    t.onLoad = () => {
      prevLoad?.();
      apply();
    };
  }, [onStaffPage]);

  if (!propertyId || !widgetId) return null;

  return (
    <>
      {/* Hide Tawk's own bubble; its chat window still opens from our button. */}
      <style>{`#tawk-bubble-container{display:none !important}${onStaffPage ? ` iframe[title*="chat widget"],iframe[src*="tawk.to"],[id^="tawk"]{display:none !important}` : ""}`}</style>
      <Script id="tawk-to" strategy="afterInteractive" src={`https://embed.tawk.to/${propertyId}/${widgetId}`} crossOrigin="anonymous" />
      {mounted && !open && !onStaffPage ? (
        <button
          type="button"
          aria-label="Open live chat. Drag to move this button."
          title="Chat with us (drag to move)"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={() => {
            if (!justDragged.current) openChat();
          }}
          style={{ left, top, width: SIZE, height: SIZE, touchAction: "none", transition: dragging ? "none" : "left 160ms ease, top 160ms ease" }}
          className={`fixed z-[2147483000] flex items-center justify-center rounded-full bg-forest text-on-photo shadow-lg ring-1 ring-gold/60 select-none ${dragging ? "scale-105 cursor-grabbing" : "cursor-grab active:scale-95"}`}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 5h16v11H9l-5 4z" />
            <path d="M8 9.5h8M8 12.5h5" />
          </svg>
          {unread ? <span aria-hidden className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-forest bg-gold-bright" /> : null}
        </button>
      ) : null}
    </>
  );
}
