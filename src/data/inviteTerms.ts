import { company } from "@/data/company";
import { INVITE_MIN_TRIP, INVITE_REWARD, INVITE_WINDOW_DAYS, PROMO_VALID_DAYS, fmtUsd } from "@/lib/credits";

/** Original wording for World Bridge Meridian. Have a lawyer review before relying on it. */
export const inviteTermsIntro = `The ${company.name} Invite Program lets customers introduce friends and earn Promo Credits. By taking part you agree to these terms, our Travel Credit terms and our general Terms & Booking Conditions.`;

export const inviteTerms: string[] = [
  `You need a registered ${company.name} account to take part. Each account has one personal invite link.`,
  `A friend qualifies if they create a new account through your link (an account created in the last ${INVITE_WINDOW_DAYS} days, with no earlier ${company.name} booking) and then book and complete a journey worth ${fmtUsd(INVITE_MIN_TRIP)} or more.`,
  `Once that journey has been completed and paid for in full, you and your friend each receive ${fmtUsd(INVITE_REWARD)} in Promo Credits. Rewards are added by our team, not instantly.`,
  `Promo Credits from the Invite Program expire ${PROMO_VALID_DAYS} days after they are added, and follow the Promo Credit rules in the Travel Credit terms (larger bookings only, capped per booking).`,
  "Each friend can be linked to one invite only, and you cannot use your own link. Invitations should be shared with people you know.",
  "You must not spam, post your link in misleading ways, offer money or other incentives for sign-ups, create several accounts, or invite yourself through another account.",
  "If a journey is cancelled or refunded, the related reward is not paid, or may be taken back from your account.",
  "We may refuse or void rewards where we suspect misuse, and may change, pause or end the program at any time. A change does not affect rewards already added to your account.",
  "Rewards are not cash, cannot be transferred, and may be treated as taxable where the law says so; you are responsible for any taxes that apply to you.",
];
