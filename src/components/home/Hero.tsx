"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { destinations } from "@/data/destinations";
import { localImage, unsplashPhoto } from "@/data/images";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

/**
 * Cinematic full-viewport hero: four slides (three destinations, then the
 * brand photograph) cross-wiped by a
 * soft misty right-to-left mask wipe (no crossfades), a thumbnail rail on
 * concentric rings, drifting mist banks and a slow Ken Burns settle.
 * Motion language adapted from a reference travel landing page, rebuilt in
 * WBM's own palette, type and photography.
 */

interface Slide {
  slug: string;
  title: string;
  kicker: string;
  railTitle: string;
  caption: string;
  image: string;
  /** Tall phone crop of the same photo; null when there is only one file. */
  imageMobile: string | null;
  /** Overrides the default photo treatment (the brand slide only). */
  imgClassName?: string;
  /** Backdrop behind the photo (the brand slide's letterbox bands). */
  backdropClassName?: string;
  thumb: string;
}

const SLIDE_DEFS: { slug: string; kicker: string; railTitle: string; imageId: string; mobileCrop: string }[] = [
  { slug: "london", kicker: "Exhibitions · Theatre · The Arts", railTitle: "Discover London", imageId: "1513026705753-bc3fffca8bf4", mobileCrop: "crop=entropy" },
  { slug: "paris", kicker: "Arts & Culture Journeys", railTitle: "Discover Paris", imageId: "1502602898657-3e91760cbb34", mobileCrop: "crop=focalpoint&fp-x=0.68" },
  { slug: "santorini", kicker: "Island Escapes", railTitle: "Discover Santorini", imageId: "1570077188670-e3a8d69ac5ff", mobileCrop: "crop=focalpoint&fp-x=0.40" },
];

/** Main slide imagery at presentation resolution; rail thumbs stay light. */
const hiRes = (url: string) =>
  url.includes("images.unsplash.com")
    ? url.replace("w=1600", "w=2560").replace("q=80", "q=90")
    : url;

/**
 * Tall crop of the same photograph for phones: a frame composed for a tall
 * screen — focal-aware where the subject sits off-centre — instead of an
 * over-zoomed slice of the wide desktop frame.
 */
const tallCrop = (id: string, crop: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${crop}&w=1200&h=1500&q=85`;

const destinationSlides: Slide[] = SLIDE_DEFS.map((def) => {
  const d = destinations.find((x) => x.slug === def.slug) ?? destinations[0];
  const base = unsplashPhoto(def.imageId);
  return {
    slug: d.slug,
    title: d.name.toUpperCase(),
    kicker: def.kicker,
    railTitle: def.railTitle,
    caption: d.shortDescription,
    image: hiRes(base),
    imageMobile: tallCrop(def.imageId, def.mobileCrop),
    thumb: base.replace("w=1600", "w=400"),
  };
});

/**
 * Fourth slide: the previous hero's brand photograph, after the locations.
 * Its treatment mirrors the pre-rebuild hero: on phones the whole artwork
 * is presented at its natural proportions, centred, its foot fading away;
 * on desktop it fills the frame at the old 62% 50% position, with no fade.
 */
const brandSlide: Slide = {
  slug: "beyond",
  title: "BEYOND",
  kicker: "Bespoke Journeys, Designed Around You",
  railTitle: "Journeys Beyond the Ordinary",
  caption: company.tagline,
  image: localImage("/images/brand/hero-art.jpg"),
  imageMobile: null,
  imgClassName:
    "h-full w-full object-contain object-center [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)] lg:object-cover lg:object-[62%_50%] lg:[mask-image:none]",
  backdropClassName: "bg-ink",
  thumb: localImage("/images/brand/hero-art.jpg"),
};

const slides: Slide[] = [...destinationSlides, brandSlide];

const WIPE_MS = 1250;
const ADVANCE_MS = 5500;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

const HERO_CSS = `
@keyframes wbm-rise { from { transform: translateY(108%); } to { transform: translateY(0); } }
@keyframes wbm-kb { from { transform: scale(1.04); } to { transform: scale(1.085); } }
@keyframes wbm-drift-a { from { transform: translate3d(-2.5%, 0, 0); } to { transform: translate3d(2.5%, -1.5%, 0); } }
@keyframes wbm-drift-b { from { transform: translate3d(3%, 1%, 0) scaleX(-1); } to { transform: translate3d(-3%, -3%, 0) scaleX(-1); } }
@keyframes wbm-clip { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0% 0 0); } }
@keyframes wbm-grow-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes wbm-grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes wbm-fade-in { from { opacity: 0; } to { opacity: 1; } }
`;

const TITLE_GRADIENT =
  "linear-gradient(180deg, rgba(248,244,234,0.97) 0%, rgba(248,244,234,0.88) 36%, rgba(248,244,234,0.18) 100%)";
const TOP_TINT =
  "linear-gradient(180deg, rgba(20,17,12,0.42) 0%, rgba(20,17,12,0.08) 26%, transparent 46%)";
const MIST_BG =
  "radial-gradient(ellipse 55% 55% at 28% 82%, rgba(255,252,246,0.55), transparent 70%), radial-gradient(ellipse 48% 45% at 72% 92%, rgba(255,252,246,0.38), transparent 70%), radial-gradient(ellipse 40% 35% at 52% 70%, rgba(255,252,246,0.3), transparent 70%)";

export function Hero() {
  const [active, setActive] = useState(0);
  const [wipe, setWipe] = useState<{ from: number; to: number; p: number } | null>(null);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [par, setPar] = useState({ x: 0, y: 0 });
  const [capPos, setCapPos] = useState<{ top: number; right: number } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the Ken Burns settle per slide

  const heroRef = useRef<HTMLElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const parRafRef = useRef<number>(0);
  const activeRef = useRef(0);
  const wipeRef = useRef<typeof wipe>(null);
  activeRef.current = active;
  wipeRef.current = wipe;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const from = activeRef.current;
      if (next === from || wipeRef.current) return;
      if (reduced) {
        setActive(next);
        setCaptionIndex(next);
        setCycle((c) => c + 1);
        return;
      }
      const start = performance.now();
      setWipe({ from, to: next, p: 0 });
      const tick = (now: number) => {
        const raw = Math.min((now - start) / WIPE_MS, 1);
        const p = easeInOutCubic(raw);
        setWipe({ from, to: next, p });
        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setActive(next);
          setWipe(null);
          setCycle((c) => c + 1);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
      // Caption swaps in partway through the wipe, as in the reference.
      window.setTimeout(() => setCaptionIndex(next), 650);
    },
    [reduced],
  );

  // Auto-advance
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      if (document.hidden || wipeRef.current) return;
      goTo((activeRef.current + 1) % slides.length);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [goTo, reduced]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Scroll choreography (rAF-throttled)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(parRafRef.current);
    parRafRef.current = requestAnimationFrame(() => setPar({ x: nx * 12, y: ny * 9 }));
  };

  // Measure the active thumbnail so the caption/connector can anchor to it.
  const measure = useCallback(() => {
    const hero = heroRef.current;
    const thumb = thumbRefs.current[active];
    if (!hero || !thumb) return;
    const hr = hero.getBoundingClientRect();
    const tr = thumb.getBoundingClientRect();
    setCapPos({
      top: tr.top - hr.top + tr.height / 2,
      right: hr.right - tr.left + hr.width * 0.008,
    });
  }, [active]);

  useLayoutEffect(() => {
    measure();
    const t = window.setTimeout(measure, 950); // after the rail reflow settles
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const topMistOpacity = Math.min(scrollY / (0.45 * vh), 1) * 0.85;
  const railOpacity = Math.max(1 - scrollY / (0.5 * vh), 0);
  const wipeEdge = wipe ? wipe.p * 135 : 0;

  const renderSlide = (slide: Slide, i: number) => {
    const isActive = !wipe && active === i;
    const isIncoming = wipe?.to === i;
    const isOutgoing = wipe?.from === i;
    if (!isActive && !isIncoming && !isOutgoing) return null;
    const p = wipe?.p ?? 0;
    let photoTransform: string | undefined;
    if (isIncoming) photoTransform = `translateX(${(1 - p) * 2}%) scale(${1.12 - 0.08 * p})`;
    if (isOutgoing) photoTransform = `translateX(${-2 * p}%) scale(${1.04 + 0.05 * p})`;
    const mask =
      isIncoming && wipe
        ? `linear-gradient(to left, #000 0%, #000 ${Math.max(wipeEdge - 35, 0)}%, rgba(0,0,0,0.6) ${Math.max(wipeEdge - 17.5, 0)}%, transparent ${wipeEdge}%)`
        : undefined;
    const TitleTag = i === 0 ? "h1" : "h2";
    return (
      <div
        key={slide.slug}
        className="absolute inset-0 overflow-hidden"
        style={{
          zIndex: isIncoming ? 3 : isOutgoing ? 2 : 2,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
        aria-hidden={!isActive && !isIncoming}
      >
        {/* Photo layer */}
        <div className="absolute -inset-[3%]" style={{ transform: photoTransform }}>
          <div
            key={isActive ? `kb-${cycle}` : undefined}
            className="absolute inset-0"
            style={isActive && !reduced ? { animation: "wbm-kb 12s linear forwards" } : undefined}
          >
            <picture
              className={`absolute inset-0 block ${slide.backdropClassName ?? ""}`}
              style={{ transform: isActive ? undefined : "scale(1.04)" }}
            >
              {slide.imageMobile && (
                <>
                  <source media="(min-width: 1024px)" srcSet={slide.image} />
                  <source media="(max-width: 1023.98px)" srcSet={slide.imageMobile} />
                </>
              )}
              <img
                src={slide.image}
                alt={`${slide.title} — ${slide.caption}`}
                className={slide.imgClassName ?? "h-full w-full object-cover"}
                draggable={false}
              />
            </picture>
          </div>
        </div>
        {/* Top tint behind the header */}
        <div className="absolute inset-0" style={{ backgroundImage: TOP_TINT }} />
        {/* Giant gradient title */}
        <div className="absolute left-6 top-[15%] z-[5] md:left-10 lg:left-[3.2vw] lg:top-[17%]">
          <p className="eyebrow-on-photo mb-4 hidden text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-gold-bright sm:block">
            {slide.kicker}
          </p>
          <TitleTag
            className="font-display max-w-[80vw] text-[13vw] font-semibold uppercase leading-[0.95] tracking-[-0.01em] sm:text-[11vw] lg:max-w-none lg:whitespace-nowrap lg:text-[8.25vw]"
            style={{
              backgroundImage: TITLE_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {slide.title.split(" ").map((word, wi) => (
              <span key={wi} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span
                  className="inline-block"
                  style={
                    i === 0 && !reduced
                      ? { animation: `wbm-rise 1.15s cubic-bezier(0.16,1,0.3,1) ${250 + wi * 90}ms both` }
                      : undefined
                  }
                >
                  {word}
                  {wi < slide.title.split(" ").length - 1 ? "\u00A0" : ""}
                </span>
              </span>
            ))}
          </TitleTag>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={heroRef}
      onPointerMove={onPointerMove}
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-scrim"
      aria-label="Featured destinations"
    >
      <style>{HERO_CSS}</style>

      {/* Scroll-lag + pointer-parallax wrappers around the slide stack */}
      <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.42}px)` }}>
        <div className="absolute inset-0" style={{ transform: `translate(${par.x}px, ${par.y}px)` }}>
          {slides.map((s, i) => renderSlide(s, i))}
        </div>
      </div>

      {/* Top mist layer — fades in on scroll */}
      <div
        className="pointer-events-none absolute -left-[4%] -right-[4%] top-[-30%] z-[6] h-[80%]"
        style={{
          backgroundImage: MIST_BG,
          mixBlendMode: "screen",
          opacity: topMistOpacity,
          transform: "scaleY(-1)",
          maskImage: "linear-gradient(to top, transparent, #000 38%)",
          WebkitMaskImage: "linear-gradient(to top, transparent, #000 38%)",
        }}
        aria-hidden
      />

      {/* Bottom mist bank — drifts, rises and swells on scroll */}
      <div
        className="pointer-events-none absolute -left-[4%] -right-[4%] bottom-[-6%] z-[7] h-[78%]"
        style={{
          transform: `translateY(${-0.38 * scrollY}px) scale(${1 + (0.35 * scrollY) / vh})`,
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: MIST_BG,
            mixBlendMode: "screen",
            animation: reduced ? undefined : "wbm-drift-a 26s ease-in-out infinite alternate",
            maskImage: "linear-gradient(to bottom, transparent, #000 38%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 38%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-85"
          style={{
            backgroundImage: MIST_BG,
            mixBlendMode: "screen",
            animation: reduced ? undefined : "wbm-drift-b 34s ease-in-out infinite alternate",
            maskImage: "linear-gradient(to bottom, transparent, #000 38%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 38%)",
          }}
        />
      </div>

      {/* Mist band riding the wipe edge */}
      {wipe && (
        <div
          className="pointer-events-none absolute top-0 z-[9] h-full w-[34vw]"
          style={{
            left: `calc(${100 - wipeEdge}% - 17vw)`,
            background:
              "radial-gradient(ellipse at center, rgba(255,244,230,0.75), transparent 70%)",
            filter: "blur(10px)",
            opacity: Math.sin(Math.PI * wipe.p) * 0.95,
          }}
          aria-hidden
        />
      )}

      {/* Bottom fade into the page */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[46%]"
        style={{
          backgroundImage:
            "linear-gradient(to top, #faf6ec 0%, rgba(250,246,236,0.92) 18%, rgba(250,246,236,0.45) 55%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Thumbnail rail */}
      <div
        className="absolute right-[4vw] top-[calc(74px+9%)] z-20 hidden flex-col items-center sm:flex"
        style={{ transform: `translateY(${scrollY * 0.2}px)`, opacity: railOpacity }}
      >
        {slides.map((slide, i) => {
          const isA = (wipe ? wipe.to : active) === i;
          return (
            <button
              key={slide.slug}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${slide.title}`}
              aria-current={isA}
              className="group relative mb-[0.9vw] shrink-0 rounded-full last:mb-0"
              style={{
                width: isA ? "clamp(96px, 11vw, 180px)" : "clamp(46px, 5.4vw, 92px)",
                height: isA ? "clamp(96px, 11vw, 180px)" : "clamp(46px, 5.4vw, 92px)",
                transition: `width 0.9s ${EASE}, height 0.9s ${EASE}`,
              }}
            >
              {isA && (
                <>
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: "calc(100% + 10vw)",
                      height: "calc(100% + 10vw)",
                      border: "1.6px solid rgba(255,255,255,0.5)",
                      animation: "wbm-fade-in 0.9s ease both",
                    }}
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: "calc(100% + 21.6vw)",
                      height: "calc(100% + 21.6vw)",
                      border: "1.6px solid rgba(255,255,255,0.5)",
                      animation: "wbm-fade-in 0.9s ease both",
                    }}
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute rounded-full"
                    style={{ inset: -9, border: "2px solid rgba(255,255,255,0.55)" }}
                    aria-hidden
                  />
                </>
              )}
              <span className="relative block h-full w-full overflow-hidden rounded-full shadow-[0_10px_26px_rgba(20,10,10,0.35)] ring-[3px] ring-white/90 transition-transform duration-500 group-hover:scale-[1.07]">
                <Image src={slide.thumb} alt="" fill sizes="180px" className="object-cover" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Caption + connector, anchored to the active thumbnail */}
      {capPos && (
        <div
          key={captionIndex}
          className="absolute z-20 hidden items-center lg:flex"
          style={{ top: capPos.top, right: capPos.right, transform: "translateY(-50%)" }}
        >
          <span
            className="mr-5 block w-[3px] shrink-0 self-center bg-white"
            style={{
              height: "max(84px, 6.5vw)",
              transformOrigin: "top",
              animation: "wbm-grow-y 0.6s cubic-bezier(0.16,1,0.3,1) both",
            }}
            aria-hidden
          />
          <div
            className="mr-5 max-w-[250px]"
            style={{ animation: "wbm-clip 0.9s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <p className="font-display text-[clamp(26px,2.75vw,40px)] font-light leading-tight text-white [text-shadow:0_2px_18px_rgba(20,10,10,0.45)]">
              {slides[captionIndex].railTitle}
            </p>
            <p className="mt-2 text-[clamp(12px,1vw,14.5px)] leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgba(20,10,10,0.5)]">
              {slides[captionIndex].caption}
            </p>
          </div>
          <span
            className="block h-[3px] shrink-0 rounded-full bg-white"
            style={{
              width: "max(40px, 4.7vw)",
              transformOrigin: "right",
              animation: "wbm-grow-x 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both",
            }}
            aria-hidden
          />
        </div>
      )}

      {/* Tagline + CTAs */}
      <div className="absolute bottom-[16vh] left-6 z-20 md:left-10 lg:bottom-[19vh] lg:left-[3.2vw]">
        <p className="eyebrow-on-photo mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-gold-bright">
          {company.heroEyebrow}
        </p>
        <p className="max-w-md text-sm leading-relaxed text-on-photo-dim md:text-base">
          {company.tagline}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/plan-your-journey" variant="photo" size="lg">
            Design Your Journey
          </Button>
          <Button href="/explore" variant="photo-outline" size="lg">
            Explore Journeys
          </Button>
        </div>
      </div>
    </section>
  );
}
