import type { GiftDesign } from "@/lib/giftCards";

const THEMES: Record<GiftDesign, { bg: string; accent: string }> = {
  classic: { bg: "linear-gradient(135deg,#1b2338 0%,#2c2e4a 55%,#4a2326 100%)", accent: "#d9ab63" },
  seasonal: { bg: "linear-gradient(135deg,#11332a 0%,#1d4a3b 55%,#5a2428 100%)", accent: "#e6c27a" },
};

/** The on-screen card. Colours are fixed (not theme tokens) so it always looks like a card. */
export function GiftCardPreview({
  design,
  amount,
  small = false,
  tail,
}: {
  design: GiftDesign;
  amount: string;
  small?: boolean;
  /** Last characters of a redeemed code, shown on cards in an account. */
  tail?: string;
}) {
  const t = THEMES[design];
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl text-white shadow-lg ${small ? "max-w-[18rem] p-4" : "max-w-sm p-6"}`}
      style={{ background: t.bg, aspectRatio: "1.6 / 1" }}
      role="img"
      aria-label={`World Bridge Meridian gift card, ${amount}`}
    >
      <p className={`font-sans font-semibold uppercase tracking-[0.22em] ${small ? "text-[0.6rem]" : "text-xs"}`} style={{ color: t.accent }}>
        Gift card
      </p>
      <p className={`mt-2 font-display ${small ? "text-2xl" : "text-4xl"}`}>{amount}</p>
      <p className={`mt-1 font-sans uppercase tracking-[0.18em] text-white/70 ${small ? "text-[0.5rem]" : "text-[0.6rem]"}`}>
        No expiration{tail ? ` · •••• ${tail}` : ""}
      </p>
      <p className={`absolute bottom-4 left-6 font-display ${small ? "text-sm left-4" : "text-xl"}`}>World Bridge Meridian</p>
      <span
        aria-hidden
        className={`absolute right-5 top-5 rounded-full border ${small ? "h-6 w-6" : "h-9 w-9"}`}
        style={{ borderColor: t.accent }}
      />
    </div>
  );
}
