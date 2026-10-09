/** One place for the Travel Credits and Invite Program numbers. Keep the SQL in
 *  supabase/travel-credits.sql and the terms text in step with these. */
export const CREDIT_MIN = 500;
export const CREDIT_MAX = 25000;
export const CREDIT_PRESETS = [500, 1000, 2000, 3000, 5000, 10000] as const;

/** Promo Credits (invite rewards, cashback, vouchers): usable on any booking, up to a share of it. */
export const PROMO_MAX_SHARE = 0.25;
export const PROMO_VALID_DAYS = 90;

/** Largest amount of Promo Credits usable on one booking of this value. */
export const promoMax = (bookingUsd: number) => Math.floor(bookingUsd * PROMO_MAX_SHARE);

/** Cashback on a completed journey, by journey total. Keep in step with staff_award_cashback(). */
export const CASHBACK_TIERS = [
  { from: 5000, pct: 15 },
  { from: 15000, pct: 20 },
  { from: 30000, pct: 25 },
] as const;

export const INVITE_REWARD = 500;
export const INVITE_MIN_TRIP = 3000;
export const INVITE_WINDOW_DAYS = 30;

export const fmtUsd = (n: number) =>
  `US$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
