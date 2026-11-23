"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notableStays, type NotableStay } from "@/data/topStays";
import { Container } from "@/components/ui/Container";

/**
 * "Signature Stays & Journeys" — a portrait-card grid of WBM's notable stays
 * (Dorset Square Hotel first: it is the house's standard London partner).
 * Clicking a card opens a full-screen detail overlay with a shared-element
 * flight: the card photo animates from the card's rectangle to the detail
 * image rectangle, then the higher-resolution image swaps in.
 * No price pills — WBM quotes per client.
 */

const PICK_SLUGS = [
  "dorset-square-hotel-london",
  "claridges-london",
  "the-ritz-paris",
  "belmond-cipriani-venice",
  "canaves-oia-santorini",
  "ciragan-palace-istanbul",
  "the-plaza-new-york",
  "hotel-bel-air-los-angeles",
];

const picks: NotableStay[] = PICK_SLUGS.map((slug) =>
  notableStays.find((s) => s.slug === slug),
).filter((s): s is NotableStay => Boolean(s));

const hiRes = (src: string) =>
  src.includes("thumb.wikimedia.org") && src.includes("/960px-")
    ? src.replace("/960px-", "/1280px-")
    : src;

interface Flight {
  stay: NotableStay;
  from: DOMRect;
}

function StayCard({
  stay,
  index,
  visible,
  onOpen,
}: {
  stay: NotableStay;
  index: number;
  visible: boolean;
  onOpen: (stay: NotableStay, img: HTMLImageElement | null) => void;
}) {
  // Entrance stagger uses a transition delay; clear it once the card has
  // risen so hover feedback stays instant.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => setEntered(true), 750 + (index % 4) * 90);
    return () => window.clearTimeout(t);
  }, [visible, index]);
  return (
    <button
      type="button"
      onClick={(e) => onOpen(stay, e.currentTarget.querySelector("img"))}
      className="group relative block aspect-[203/268] w-full overflow-hidden rounded-xl text-left shadow-[0_12px_30px_rgba(90,64,30,0.18)] transition-all duration-700 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(90,64,30,0.28)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? undefined : "translateY(40px)",
        transitionDelay: entered ? "0ms" : `${(index % 4) * 90}ms`,
      }}
      aria-label={`View ${stay.name}`}
    >
      <Image
        src={stay.heroImage}
        alt={stay.name}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1000px) 50vw, 25vw"
        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07]"
      />
      <span className="scrim-card absolute inset-0" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 p-4">
        <span className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-bright">
          {stay.kind}
        </span>
        <span className="font-display block text-[1.05rem] leading-snug text-on-photo">
          {stay.name}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-xs text-on-photo-dim">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          {stay.place}
        </span>
      </span>
    </button>
  );
}

export function SignatureStays() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<NotableStay | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [flightDone, setFlightDone] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Scroll-into-view staggered rise
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const openDetail = useCallback((stay: NotableStay, img: HTMLImageElement | null) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (img && !reduced) {
      setFlight({ stay, from: img.getBoundingClientRect() });
      setFlightDone(false);
    } else {
      setFlight(null);
      setFlightDone(true);
    }
    setDetail(stay);
  }, []);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setFlight(null);
    setFlightDone(false);
  }, []);

  // While the overlay is open: lock body scroll, tell the header to stay
  // solid, and close on Escape.
  useEffect(() => {
    if (!detail) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("wbm:detail-open"));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKey);
    overlayRef.current?.scrollTo({ top: 0 });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.dispatchEvent(new CustomEvent("wbm:detail-close"));
      document.removeEventListener("keydown", onKey);
    };
  }, [detail, closeDetail]);

  // Run the shared-element flight once the overlay has mounted.
  useEffect(() => {
    if (!flight || !detail) return;
    const clone = cloneRef.current;
    const target = targetRef.current;
    if (!clone || !target) {
      setFlightDone(true);
      return;
    }
    const to = target.getBoundingClientRect();
    const from = flight.from;
    const anim = clone.animate(
      [
        {
          top: `${from.top}px`,
          left: `${from.left}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
          borderRadius: "12px",
        },
        {
          top: `${to.top}px`,
          left: `${to.left}px`,
          width: `${to.width}px`,
          height: `${to.height}px`,
          borderRadius: "10px",
        },
      ],
      { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      setFlightDone(true);
      setFlight(null);
    };
    return () => anim.cancel();
  }, [flight, detail]);

  const enquire = (stay: NotableStay) => {
    try {
      sessionStorage.setItem(
        "wbm-enquiry",
        JSON.stringify({ item: stay.name, kind: "stay", destination: stay.place }),
      );
    } catch {
      /* the query params below still carry it */
    }
    router.push(
      `/plan-your-journey?kind=stay&item=${encodeURIComponent(stay.name)}&destination=${encodeURIComponent(stay.place)}`,
    );
  };

  const similar = detail ? picks.filter((s) => s.slug !== detail.slug).slice(0, 4) : [];

  return (
    <section className="py-16 md:py-24" aria-label="Signature stays and journeys">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Handpicked Addresses</p>
            <h2 className="font-display text-3xl leading-tight text-ivory md:text-[2.6rem]">
              Signature Stays &amp; Journeys
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone md:text-base">
              The addresses we return to — beginning with Dorset Square, our standard London
              partner for exhibition journeys. Every stay is quoted per client, never off a
              shelf.
            </p>
          </div>
          <Link
            href="/stays"
            className="rounded-full border-[1.4px] border-ivory px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            See All Stays
          </Link>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {picks.map((stay, i) => (
            <StayCard key={stay.slug} stay={stay} index={i} visible={visible} onOpen={openDetail} />
          ))}
        </div>
      </Container>

      {/* Detail overlay */}
      {detail && (
        <div
          ref={overlayRef}
          className="animate-fade-in fixed inset-0 z-30 overflow-y-auto bg-ink"
          role="dialog"
          aria-modal="true"
          aria-label={detail.name}
        >
          {/* Peach-warm band echoing the reference detail page, in brand tones */}
          <div className="h-[290px] bg-charcoal" aria-hidden />
          <Container className="relative -mt-[290px] pb-20 pt-28 md:pt-32">
            <div className="mb-8 flex items-start justify-between gap-4">
              <nav aria-label="Breadcrumb" className="text-xs text-stone md:text-[0.8rem]">
                <button type="button" onClick={closeDetail} className="font-semibold text-ivory hover:text-gold">
                  Home
                </button>
                <span className="mx-2" aria-hidden>›</span>
                <Link href="/stays" className="hover:text-gold">Stays</Link>
                <span className="mx-2" aria-hidden>›</span>
                <span className="text-stone-dim">
                  {detail.name}, {detail.place}
                </span>
              </nav>
              <button
                type="button"
                onClick={closeDetail}
                aria-label="Close details"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-ink text-ivory transition-colors hover:border-gold hover:text-gold"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.18fr_1fr]">
              {/* Main image — the flight target */}
              <div>
                <div
                  ref={targetRef}
                  className="relative aspect-[512/445] w-full overflow-hidden rounded-[10px] bg-charcoal-2"
                >
                  <Image
                    src={hiRes(detail.heroImage)}
                    alt={detail.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                    style={{ opacity: flightDone ? 1 : 0, transition: "opacity 0.25s ease" }}
                  />
                </div>
                {detail.credit && (
                  <p className="mt-3 text-[0.7rem] text-stone-dim">
                    Photo:{" "}
                    {detail.creditUrl ? (
                      <a href={detail.creditUrl} target="_blank" rel="noreferrer" className="underline hover:text-gold">
                        {detail.credit}
                      </a>
                    ) : (
                      detail.credit
                    )}
                  </p>
                )}
                <div className="mt-8 hidden gap-4 lg:grid lg:grid-cols-3">
                  {similar.slice(0, 3).map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => {
                        setFlightDone(true);
                        setDetail(s);
                      }}
                      className="group relative aspect-square overflow-hidden rounded-[10px]"
                      aria-label={`View ${s.name}`}
                    >
                      <Image src={s.heroImage} alt={s.name} fill sizes="20vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                      <span className="scrim-card absolute inset-0" aria-hidden />
                      <span className="absolute inset-x-0 bottom-0 p-3 text-left font-display text-sm text-on-photo">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail column */}
              <div>
                <p className="eyebrow mb-3">{detail.kind}</p>
                <h3 className="font-display text-4xl leading-tight text-ivory md:text-[2.6rem]">
                  {detail.name}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-stone">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {detail.place}
                </p>
                {detail.nearGallery && (
                  <p className="mt-4 inline-block rounded-full border border-line bg-charcoal px-3.5 py-1.5 text-xs text-ivory-dim">
                    Walking distance to {detail.nearGallery}
                  </p>
                )}
                <h4 className="font-display mt-8 text-xl text-ivory">About this stay</h4>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory-dim">
                  {detail.description}
                </p>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ivory-dim">
                  As with every World Bridge Meridian journey, the stay is arranged around you —
                  rooms, transfers, dining and access confirmed by your consultant before a
                  single invoice is raised.
                </p>

                <div className="mt-8 rounded-[18px] bg-white p-6 shadow-[0_18px_50px_rgba(90,64,30,0.16)] ring-1 ring-line">
                  <p className="font-display text-lg text-ivory">Stay at {detail.name}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone">
                    Priced per journey, not per night off a shelf. Tell us your dates and party
                    size and we will quote the whole arrangement.
                  </p>
                  <button
                    type="button"
                    onClick={() => enquire(detail)}
                    className="mt-5 w-full rounded-full bg-gold py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gold-dim"
                  >
                    Enquire About This Stay
                  </button>
                </div>
              </div>
            </div>

            {/* Similar stays */}
            <div className="mt-16">
              <h4 className="font-display mb-6 text-2xl text-ivory">Similar Places to Stay</h4>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {similar.map((s, i) => (
                  <StayCard
                    key={s.slug}
                    stay={s}
                    index={i}
                    visible
                    onOpen={(stay) => {
                      setFlightDone(true);
                      setFlight(null);
                      setDetail(stay);
                    }}
                  />
                ))}
              </div>
            </div>
          </Container>

          {/* Flying photo clone */}
          {flight && (
            <div
              ref={cloneRef}
              className="pointer-events-none fixed z-40 overflow-hidden"
              style={{
                top: flight.from.top,
                left: flight.from.left,
                width: flight.from.width,
                height: flight.from.height,
                borderRadius: 12,
              }}
              aria-hidden
            >
              <Image src={flight.stay.heroImage} alt="" fill sizes="50vw" className="object-cover" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
