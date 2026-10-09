/** One place for the Travel Credits and Invite Program numbers. Keep the SQL in
 *  supabase/travel-credits.sql and the terms text in step with these. */
export const CREDIT_MIN = 500;
export const CREDIT_MAX = 25000;
export const CREDIT_PRESETS = [500, 1000, 2000, 3000, 5000, 10000] as const;

/** Promo credits: only on bigger trips, in steps, and only a share of the trip. */
export const PROMO_MIN_BOOKING = 2000;
export const PROMO_STEP = 100;
export const PROMO_SHARE = 0.05;
export const PROMO_VALID_DAYS = 90;

/** Largest amount of promo credits usable on one booking of this value. */
export function promoMax(bookingUsd: number): number {
  if (bookingUsd < PROMO_MIN_BOOKING) return 0;
  return Math.floor((bookingUsd * PROMO_SHARE) / PROMO_STEP) * PROMO_STEP;
}

/** Rows for the redemption table in the terms. */
export const PROMO_TIERS = [2000, 4000, 6000, 8000, 10000].map((from, i, all) => ({
  from,
  to: i < all.length - 1 ? all[i + 1] - 1 : null,
  max: promoMax(from),
}));

export const INVITE_REWARD = 100;
export const INVITE_MIN_TRIP = 3000;
export const INVITE_WINDOW_DAYS = 30;

export const fmtUsd = (n: number) =>
  `US$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
