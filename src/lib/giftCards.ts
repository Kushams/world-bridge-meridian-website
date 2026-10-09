export const GIFT_PRESETS = [50, 100, 500, 1000, 2000, 5000] as const;
export const GIFT_MIN = 50;
export const GIFT_MAX_TOTAL = 25000;
export const GIFT_MAX_QTY = 100;

export type GiftDesign = "classic" | "seasonal";

export const GIFT_DESIGNS: { key: GiftDesign; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "seasonal", label: "Seasonal" },
];

export const usd = (n: number) =>
  `US$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const usdFromCents = (cents: number) => usd(cents / 100);
