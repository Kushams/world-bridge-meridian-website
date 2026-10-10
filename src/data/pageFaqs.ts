import { company } from "@/data/company";
import { CASHBACK_TIERS, CREDIT_MAX, CREDIT_MIN, PROMO_MAX_SHARE, PROMO_VALID_DAYS, INVITE_REWARD, INVITE_MIN_TRIP, INVITE_WINDOW_DAYS, fmtUsd } from "@/lib/credits";

export interface FaqItem { q: string; a: string }

export const faqMain: FaqItem[] = [
  {
    q: "What is World Bridge Meridian?",
    a: `${company.name} is a bespoke travel group founded in ${company.foundedYear} by ${company.founderName}. We design private, made-to-measure journeys — luxury escapes, cultural and arts travel, family holidays, honeymoons, group departures, corporate travel and cruises — planned around the people taking them rather than sold from a catalog.`,
  },
  {
    q: "What kinds of trips does World Bridge Meridian plan?",
    a: "Bespoke and private journeys, luxury travel, arts and culture trips built around exhibitions, museums and art fairs, family travel, couples travel and honeymoons, group and institutional travel, corporate travel, and cruises. Destinations span North America, Europe, the Middle East & Africa, Asia-Pacific and the Indian Ocean.",
  },
  {
    q: "How do I contact World Bridge Meridian?",
    a: `Email ${company.email}${company.phone ? `, call ${company.phone}` : ""}, use the contact form on our Contact page, or start a request with the Plan Your Journey form. A travel designer replies personally.`,
  },
  {
    q: "How does planning a journey with World Bridge Meridian work?",
    a: "It starts with a conversation, not a catalog. You tell us where you'd like to go (or simply what kind of experience you're after), who's traveling, when, and your general budget. We then propose an itinerary, refine it with you, and confirm accommodation, transportation and experiences before you travel.",
  },
  {
    q: "Do I need to know exactly where I want to go?",
    a: "No. Many clients start with a feeling — a type of experience, a season, a budget — rather than a specific destination. We help narrow it down from there.",
  },
  {
    q: "Are the prices shown on the website guaranteed?",
    a: "No. Prices shown throughout the site are indicative starting prices, used for planning purposes. Final pricing depends on travel dates, availability, accommodation selection, number of travelers and supplier pricing, and is confirmed after consultation and an availability check.",
  },
  {
    q: "How far in advance should I start planning?",
    a: "It depends on the destination and season. Popular honeymoon destinations and peak-season travel are best started six to nine months ahead; shoulder-season or less in-demand journeys can often be arranged with considerably less notice.",
  },
  {
    q: "Can you organize travel for a group, school, or corporate team?",
    a: "Yes. We coordinate group itineraries, accommodation, transportation and activities as a single journey rather than a stack of individual bookings — see our Group Travel and Corporate Travel pages for more detail.",
  },
  {
    q: "Do you book flights?",
    a: "We coordinate air travel as part of a full itinerary. World Bridge Meridian is not primarily a flight-booking service — our focus is organizing the journey around your flights, accommodation, transportation and experiences.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Bank transfer, arranged by the consultant assigned to your booking (including local-currency transfers through our regional payment intermediaries in many countries), and cryptocurrency, which we've accepted since 2015 — Bitcoin, Ethereum, USDT, USDC and Solana. There's no online checkout; payment details are confirmed with you directly once your journey is finalized. Our Payment Options page explains each method and includes a step-by-step guide to buying crypto in your country.",
  },
  {
    q: "Is my information secure?",
    a: "We take data handling seriously and do not store payment details ourselves. Details on data handling will be published in our Privacy Policy.",
  },
  {
    q: "What if something needs to change after I've booked?",
    a: "You'll have a direct point of contact throughout your journey. Changes are handled case by case, depending on the suppliers and timing involved.",
  },
  {
    q: "Do you have live availability for cruises and hotels shown on the site?",
    a: "Not yet for every listing. Cruise sailings and some current journeys shown on the site are sample or indicative data pending live supplier integration — these are clearly labeled. Availability is always confirmed at enquiry.",
  },
];


export const faqGiftCards: FaqItem[] = [
  { q: "Does a gift card expire?", a: "No. Gift cards never expire." },
  { q: "What can I use it on?", a: `Journeys and services from ${company.name}. When you book, your consultant applies the balance and tells you what remains.` },
  { q: "How do I redeem a code?", a: "Sign in to My World Bridge, open Travel Credits and enter the code. The value becomes Travel Credits in your account, which never expire." },
  { q: "Can I get a refund?", a: "Gift cards are not refundable or exchangeable for cash once issued, except where the law requires. Full details are in the gift card terms." },
  { q: "How long does it take?", a: "We issue the card once your payment is verified on the blockchain. You'll get an email as soon as it's done." },
  { q: "I need more than US$25,000.", a: `Email ${company.email} and your consultant will arrange it.` },
];


export const faqCredits: FaqItem[] = [
  {
    q: "How can I buy Travel Credits?",
    a: "Sign in to your account, choose an amount and pay with cryptocurrency on this page. Our team verifies your payment on the blockchain, then adds the credits to My World Bridge.",
  },
  {
    q: "How long are Travel Credits valid for?",
    a: `There are two types. Travel Credits that you buy, receive as a refund, or redeem from a gift card never expire. Promo Credits from promotions, vouchers and the Invite Program always have an expiry date (usually ${PROMO_VALID_DAYS} days), shown in your account.`,
  },
  {
    q: "Is there a limit on how many Travel Credits I can buy?",
    a: `No limit on how many you can hold. Each purchase is between ${fmtUsd(CREDIT_MIN)} and ${fmtUsd(CREDIT_MAX)}. For more, email ${company.email}.`,
  },
  {
    q: "What is the difference between Travel Credits and Promo Credits?",
    a: "Travel Credits are money you have paid or been refunded: they never expire and can cover up to 100% of any booking. Promo Credits are rewards: they expire, apply to larger bookings only, and are capped per booking.",
  },
  {
    q: "How do Promo Credits work?",
    a: `They are free credits from us (cashback, invite rewards, vouchers). Each batch lasts ${PROMO_VALID_DAYS} days from the day we give it. You can use them on any booking, up to ${Math.round(PROMO_MAX_SHARE * 100)}% of its price, for example up to ${fmtUsd(1000)} on a ${fmtUsd(4000)} journey. Unused Promo Credits expire.`,
  },
  {
    q: "How does cashback work?",
    a: `When a journey of ${fmtUsd(CASHBACK_TIERS[0].from)} or more is completed and paid, you get ${CASHBACK_TIERS.map((t) => `${t.pct}% from ${fmtUsd(t.from)}`).join(", ")} back as Promo Credits.`,
  },
  {
    q: "I have a gift card or voucher code.",
    a: "Open My World Bridge, go to Travel Credits and enter the code. A gift card becomes Travel Credits; a voucher becomes Promo Credits.",
  },
];


export const faqInvite: FaqItem[] = [
  { q: "What is the Invite Program?", a: `A way to introduce friends to ${company.name} and be rewarded when they travel. You each receive ${fmtUsd(INVITE_REWARD)} in Promo Credits.` },
  { q: "Who can my friend be?", a: `Anyone with a new account, created in the last ${INVITE_WINDOW_DAYS} days through your link, who has not booked with us before.` },
  { q: "When do I receive my reward?", a: `After your friend's journey of ${fmtUsd(INVITE_MIN_TRIP)} or more has been completed and paid for. Our team adds the credits to both accounts and you will see them in My World Bridge.` },
  { q: "Do the rewards expire?", a: `Yes. They are Promo Credits and expire ${PROMO_VALID_DAYS} days after they are added. They can be used on any booking, up to 25% of its price.` },
  { q: "My friend already has an account.", a: "Sorry, the invite only works for new accounts. Your friend needs to sign up through your link." },
  { q: "Where do I see how my invites are going?", a: "On this page, once you are signed in: friends who joined, who has completed a journey, and what you have earned." },
];

