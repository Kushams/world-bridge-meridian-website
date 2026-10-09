"use client";

import { Fragment, useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * A heading whose words sharpen into place one after another as it scrolls into view. The text stays
 * readable to screen readers and search engines; if scripts are slow the stylesheet shows it anyway
 * after 2.4s; with reduced motion it simply appears. Idea adapted from Arc (MIT), see docs/THIRD_PARTY.md.
 */
export function BlurTitle({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReduced = useReducedMotion();
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const reduced = ready && Boolean(prefersReduced);
  const words = text.split(" ").filter(Boolean);
  const step = Math.min(motionTokens.stagger.word * 1.5, 0.4 / Math.max(words.length, 1));
  const visible = inView || Boolean(reduced);

  return (
    <span ref={ref} className={`blur-title ${ready ? "" : "blur-title-pending"} ${className}`}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span
            aria-hidden
            className="blur-title-word"
            initial={false}
            animate={visible ? { opacity: 1, y: "0em", filter: "blur(0px)" } : { opacity: 0, y: "0.2em", filter: `blur(${motionTokens.blur.text}px)` }}
            transition={reduced ? { duration: 0 } : visible ? { duration: 0.7, delay: i * step, ease: motionTokens.ease.enter } : { duration: 0 }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
