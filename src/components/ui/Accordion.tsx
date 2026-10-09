"use client";

import { ReactNode, useId, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { motionTokens } from "@/lib/motion";

export interface AccordionItem {
  title: string;
  content: ReactNode;
}

/** Height follows the content on a spring that never overshoots; the answer settles in with a brief focus pull. Idea from Arc (MIT), see docs/THIRD_PARTY.md. */
const panel: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter } } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard } } },
};
const content: Variants = {
  open: { y: 0, filter: "blur(0px)", transition: { y: motionTokens.spring.smooth, filter: { duration: motionTokens.duration.standard } } },
  closed: { y: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast } },
};
const still: Variants = {
  open: { height: "auto", opacity: 1, visibility: "visible", transition: { duration: 0 } },
  closed: { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" }, transition: { duration: 0 } },
};

/** Animated accordion in the site's own style. One item open at a time unless `multiple`. */
export function Accordion({ items, defaultOpen = -1, multiple = false, className = "" }: { items: AccordionItem[]; defaultOpen?: number; multiple?: boolean; className?: string }) {
  const base = useId();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number[]>(defaultOpen >= 0 ? [defaultOpen] : []);
  const toggle = (i: number) =>
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : multiple ? [...cur, i] : [i]));

  return (
    <div className={`divide-y divide-line border-t hairline ${className}`}>
      {items.map((item, i) => {
        const isOpen = open.includes(i);
        const id = `${base}-${i}`;
        return (
          <div key={item.title} className="py-1">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-button`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-lg text-ivory"
              >
                <span>{item.title}</span>
                <motion.span aria-hidden className="shrink-0 text-gold" initial={false} animate={{ rotate: isOpen ? 45 : 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
                  +
                </motion.span>
              </button>
            </h3>
            <motion.div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} initial={false} animate={isOpen ? "open" : "closed"} variants={reduced ? still : panel} className="overflow-hidden">
              <motion.div variants={reduced ? undefined : content} className="pb-5 text-sm text-stone leading-relaxed">
                {item.content}
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/** FAQ list from plain question/answer pairs (usable from server components). */
export function FaqList({ items, className = "" }: { items: { q: string; a: string }[]; className?: string }) {
  return <Accordion className={className} items={items.map((f) => ({ title: f.q, content: <p>{f.a}</p> }))} />;
}
