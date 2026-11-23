"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { destinations } from "@/data/destinations";
import type { Destination } from "@/data/types";
import { Container } from "@/components/ui/Container";

/**
 * Floating journey enquiry bar overlapping the hero. Destination, dates and
 * travellers are collected with popovers (the calendar is a single month
 * grid: first click sets departure, second sets return, then the travellers
 * popover opens). Sending stashes the selection in sessionStorage under
 * "wbm-enquiry" and routes to /plan-your-journey with query params the
 * JourneyWizard already knows how to prefill from (destination / dates /
 * notes), so the bar never dead-ends.
 */

type Panel = "dest" | "dates" | "trav" | null;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fmtFull = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function PinIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gold">
      <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gold">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gold">
      <circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19.5c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.9M17.8 15.3c1.5.7 2.4 2 2.7 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function EnquiryBar() {
  const router = useRouter();
  const [dest, setDest] = useState<Destination | null>(null);
  const [depart, setDepart] = useState<Date | null>(null);
  const [ret, setRet] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [open, setOpen] = useState<Panel>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

  // Click-outside + Escape closes popovers
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    // Monday-first offset
    const lead = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d));
    return list;
  }, [viewMonth]);

  const pickDay = (day: Date) => {
    if (!depart || (depart && ret)) {
      setDepart(day);
      setRet(null);
      return;
    }
    if (day.getTime() === depart.getTime()) return;
    if (day > depart) {
      setRet(day);
      window.setTimeout(() => setOpen("trav"), 380);
    } else {
      setDepart(day);
    }
  };

  const totalTravellers = adults + children;
  const travellerLabel = `${totalTravellers} traveller${totalTravellers === 1 ? "" : "s"}`;

  const send = () => {
    const stash = {
      destination: dest?.name ?? "",
      depart: depart ? depart.toISOString() : "",
      return: ret ? ret.toISOString() : "",
      adults,
      children,
    };
    try {
      sessionStorage.setItem("wbm-enquiry", JSON.stringify(stash));
    } catch {
      /* storage unavailable — the query params below still carry the choices */
    }
    const params = new URLSearchParams();
    if (dest) params.set("destination", dest.name);
    if (depart && ret) params.set("dates", `${fmtFull(depart)} – ${fmtFull(ret)}`);
    else if (depart) params.set("dates", `From ${fmtFull(depart)}`);
    else if (ret) params.set("dates", `Until ${fmtFull(ret)}`);
    params.set(
      "notes",
      `Travellers: ${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}`,
    );
    const qs = params.toString();
    router.push(qs ? `/plan-your-journey?${qs}` : "/plan-your-journey");
  };

  const fieldCls = (panel: Panel) =>
    `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
      open === panel ? "bg-white shadow-[0_8px_24px_rgba(120,90,40,0.16)] ring-1 ring-line" : "hover:bg-white hover:shadow-[0_8px_24px_rgba(120,90,40,0.12)]"
    }`;

  const fieldLabel = "block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-stone";
  const fieldValue = "block truncate text-[0.95rem] font-medium text-ivory";

  return (
    <section className="relative z-30 -mt-16 md:-mt-20" aria-label="Start planning your journey">
      <Container>
        <div
          ref={rootRef}
          className="relative mx-auto max-w-[920px] rounded-[24px] bg-[#fffdf6]/95 p-3 shadow-[0_18px_60px_rgba(90,64,30,0.20)] ring-1 ring-line backdrop-blur"
        >
          <div className="grid grid-cols-2 items-stretch gap-1.5 lg:grid-cols-[1.35fr_1fr_1fr_1fr_auto]">
            {/* Destination */}
            <button type="button" className={fieldCls("dest")} onClick={() => setOpen(open === "dest" ? null : "dest")} aria-haspopup="listbox" aria-expanded={open === "dest"}>
              <PinIcon />
              <span className="min-w-0">
                <span className={fieldLabel}>Destination</span>
                <span className={fieldValue}>{dest ? dest.name : "Choose destination"}</span>
              </span>
            </button>

            {/* Depart */}
            <button type="button" className={fieldCls("dates")} onClick={() => setOpen(open === "dates" ? null : "dates")} aria-haspopup="dialog" aria-expanded={open === "dates"}>
              <CalendarIcon />
              <span className="min-w-0">
                <span className={fieldLabel}>Depart</span>
                <span className={fieldValue}>{depart ? fmtShort(depart) : "Add date"}</span>
              </span>
            </button>

            {/* Return */}
            <button type="button" className={fieldCls("dates")} onClick={() => setOpen(open === "dates" ? null : "dates")} aria-haspopup="dialog" aria-expanded={open === "dates"}>
              <CalendarIcon />
              <span className="min-w-0">
                <span className={fieldLabel}>Return</span>
                <span className={fieldValue}>{ret ? fmtShort(ret) : "Add date"}</span>
              </span>
            </button>

            {/* Travellers */}
            <button type="button" className={fieldCls("trav")} onClick={() => setOpen(open === "trav" ? null : "trav")} aria-haspopup="dialog" aria-expanded={open === "trav"}>
              <PeopleIcon />
              <span className="min-w-0">
                <span className={fieldLabel}>Travellers</span>
                <span className={fieldValue}>{travellerLabel}</span>
              </span>
            </button>

            {/* Send */}
            <button
              type="button"
              onClick={send}
              className="group col-span-2 flex items-center justify-center gap-2.5 rounded-2xl bg-ivory px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-gold lg:col-span-1"
            >
              Plan
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="transition-transform duration-300 group-hover:-rotate-[8deg] group-hover:scale-110">
                <path d="M21 3L10.2 13.8M21 3l-6.8 18-3.4-7.2L3.6 10.4L21 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Destination popover */}
          {open === "dest" && (
            <div className="absolute inset-x-3 top-full z-40 mt-3 max-h-80 overflow-auto rounded-[18px] bg-white p-2 shadow-[0_24px_70px_rgba(90,64,30,0.28)] ring-1 ring-line sm:inset-x-auto sm:left-3 sm:w-80" role="listbox" aria-label="Destinations">
              {destinations.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  role="option"
                  aria-selected={dest?.slug === d.slug}
                  onClick={() => {
                    setDest(d);
                    setOpen("dates");
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-charcoal ${
                    dest?.slug === d.slug ? "bg-charcoal" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-ivory">{d.name}</span>
                  <span className="text-xs text-stone">{d.country}</span>
                </button>
              ))}
            </div>
          )}

          {/* Calendar popover */}
          {open === "dates" && (
            <div className="absolute inset-x-3 top-full z-40 mt-3 rounded-[18px] bg-white p-5 shadow-[0_24px_70px_rgba(90,64,30,0.28)] ring-1 ring-line sm:inset-x-auto sm:left-1/2 sm:w-[350px] sm:-translate-x-1/2" role="dialog" aria-label="Choose travel dates">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ivory transition-colors hover:border-gold hover:text-gold"
                >
                  ‹
                </button>
                <p className="font-display text-base text-ivory">
                  {viewMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </p>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ivory transition-colors hover:border-gold hover:text-gold"
                >
                  ›
                </button>
              </div>
              <div className="mb-1 grid grid-cols-7 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-stone-dim">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-1">{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {cells.map((day, idx) => {
                  if (!day) return <span key={`blank-${idx}`} />;
                  const t = day.getTime();
                  const disabled = t < today.getTime();
                  const isStart = depart?.getTime() === t;
                  const isEnd = ret?.getTime() === t;
                  const inRange = depart && ret && t > depart.getTime() && t < ret.getTime();
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickDay(day)}
                      aria-label={fmtFull(day)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
                        disabled
                          ? "cursor-not-allowed text-stone-dim/40"
                          : isStart || isEnd
                            ? "bg-ivory font-semibold text-ink"
                            : inRange
                              ? "rounded-none bg-gold/15 text-ivory hover:bg-gold/25"
                              : "text-ivory hover:bg-charcoal"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-stone">
                {depart && ret
                  ? `${fmtShort(depart)} – ${fmtShort(ret)}`
                  : depart
                    ? "Now choose your return date"
                    : "Choose your departure date"}
              </p>
            </div>
          )}

          {/* Travellers popover */}
          {open === "trav" && (
            <div className="absolute inset-x-3 top-full z-40 mt-3 rounded-[18px] bg-white p-5 shadow-[0_24px_70px_rgba(90,64,30,0.28)] ring-1 ring-line sm:inset-x-auto sm:right-3 sm:w-72" role="dialog" aria-label="Choose travellers">
              {(
                [
                  { label: "Adults", hint: "Ages 13+", value: adults, set: setAdults, min: 1, max: 16 },
                  { label: "Children", hint: "Ages 2–12", value: children, set: setChildren, min: 0, max: 10 },
                ] as const
              ).map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span>
                    <span className="block text-sm font-medium text-ivory">{row.label}</span>
                    <span className="block text-xs text-stone">{row.hint}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label={`Remove one ${row.label}`}
                      onClick={() => row.set(Math.max(row.min, row.value - 1))}
                      disabled={row.value <= row.min}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-base text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-35"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-ivory">{row.value}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${row.label}`}
                      onClick={() => row.set(Math.min(row.max, row.value + 1))}
                      disabled={row.value >= row.max}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-base text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-35"
                    >
                      +
                    </button>
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="mt-4 w-full rounded-xl bg-charcoal py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-charcoal-2"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
