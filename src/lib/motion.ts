/**
 * Shared motion presets. Values and approach adapted from Arc (https://github.com/kuratlielia/arc-library,
 * MIT License, Copyright (c) 2026 Elia Kuratli). See docs/THIRD_PARTY.md.
 */
export const motionTokens = {
  duration: { fast: 0.16, standard: 0.24 },
  ease: { enter: [0.16, 1, 0.3, 1] as [number, number, number, number], standard: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  spring: { smooth: { type: "spring", visualDuration: 0.4, bounce: 0 } as const, snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 } as const },
  stagger: { word: 0.04 },
  blur: { subtle: 2, text: 8 },
} as const;
