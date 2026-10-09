import { company } from "@/data/company";
import { CASHBACK_TIERS, CREDIT_MAX, CREDIT_MIN, PROMO_MAX_SHARE, PROMO_VALID_DAYS, fmtUsd } from "@/lib/credits";

/** Original wording for World Bridge Meridian (modelled on how Travel Credits work in the
 *  industry, not copied). Have a lawyer review before relying on it. */
export const creditTermsIntro = `By buying, holding, receiving or using Travel Credits or Promo Credits (together, "Credits"), you agree to these terms. They sit alongside our general Terms & Booking Conditions.`;

export const creditTerms: string[] = [
  `You need a registered ${company.name} account to buy, hold or use Credits.`,
  `Credits can only be used toward journeys and services provided by ${company.name}. Your consultant applies them when your booking is confirmed and tells you what remains.`,
  "Credits are in US dollars: 1 Credit = US$1. They cannot be exchanged for cash, cryptocurrency or anything else of value.",
  "Credits are not transferable. They cannot be sold, traded or bartered. (A gift card code can be given to someone else before it is redeemed.)",
  `There are two kinds. Travel Credits (Standard Credits) that you buy, receive as a refund, or redeem from a gift card never expire. Promo Credits that come from promotions, vouchers or the Invite Program always have an expiry date, shown in your account (usually ${PROMO_VALID_DAYS} days).`,
  "Standard Credits can be used on a booking of any value, up to 100% of its price. If you cancel a booking paid with Standard Credits, they are returned to your account, less any cancellation charges that apply to that booking.",
  `Promo Credits can be used on a booking of any size, up to ${Math.round(PROMO_MAX_SHARE * 100)}% of the booking total (for example, up to ${fmtUsd(1000)} on a ${fmtUsd(4000)} journey). You do not have to use your whole balance at once, and unused Promo Credits expire ${PROMO_VALID_DAYS} days after the day we give them.`,
  `Cashback: when a journey of ${fmtUsd(CASHBACK_TIERS[0].from)} or more has been completed and paid in full, we add Promo Credits to your account: ${CASHBACK_TIERS.map((t) => `${t.pct}% of the journey total from ${fmtUsd(t.from)}`).join(", ")}. Cashback is paid once per journey, is not paid on journeys that are cancelled or refunded, and can be taken back if the journey is later refunded.`,
  "Promo Credits that have been used on a booking are not refundable if that booking is cancelled, whether by you or for any other reason.",
  "You can combine Credits with any of our other payment methods.",
  `You can buy Travel Credits in amounts from ${fmtUsd(CREDIT_MIN)} to ${fmtUsd(CREDIT_MAX)} per purchase, paid in cryptocurrency. We verify each payment on the blockchain before the credits are added to your account. There is no limit on how many Credits you can hold.`,
  `If you use more than one account to get around these limits, trade Credits, or otherwise break these terms or the law, we may void some or all of your Credits and cancel related bookings without refund.`,
  "We may update these terms from time to time. A change applies to Credits bought or received after it is published; Credits you already hold keep the terms in force when you received them unless the law requires otherwise.",
];
