/**
 * "How to buy crypto and pay us" guide shown on /payments.
 *
 * Exchanges listed are widely used examples, not endorsements or partners.
 * Availability, licensing and listed assets change — re-check each region
 * when updating `cryptoGuideReviewed`.
 */

export const cryptoGuideReviewed = "October 2026";

export const cryptoBuyingSteps: { title: string; body: string }[] = [
  {
    title: "Confirm the details with your consultant",
    body: "Before buying anything, get the exact amount, the asset (for example USDC or BTC) and the network from your World Bridge Meridian consultant. Buy and send only what was agreed for your booking.",
  },
  {
    title: "Open an account with a regulated exchange",
    body: "Choose an exchange that is licensed or registered where you live — see the regional guide below. Sign up with your legal name and complete identity verification (usually a photo ID and a selfie). Verification can take anywhere from minutes to a few days, so do it early.",
  },
  {
    title: "Add money in your local currency",
    body: "Deposit funds by bank transfer, debit card or a local payment method. Bank transfers are usually the cheapest; cards are faster but carry higher fees. Some banks limit payments to exchanges, so a transfer may need to be approved by your bank.",
  },
  {
    title: "Buy the agreed cryptocurrency",
    body: "Stablecoins (USDC or USDT) are usually the most practical for travel payments, because they track the US dollar and won't move in value between confirmation and payment. If you're paying in BTC, ETH or SOL, buy shortly before sending.",
  },
  {
    title: "Withdraw to our address on the correct network",
    body: "Choose Send or Withdraw, paste our address exactly as published on this page, and select the matching network — for example USDT on Tron (TRC20) or USDC on Base. Check the first and last few characters of the address. Exchanges charge a network fee, so make sure the amount we receive covers the agreed total.",
  },
  {
    title: "Send a small test first for large payments",
    body: "For larger amounts, send a small test transaction, ask your consultant to confirm it arrived, then send the balance. Some exchanges ask who you are sending to (the \u201ctravel rule\u201d): the recipient is World Bridge Meridian, a business.",
  },
  {
    title: "Record your transaction reference",
    body: "Once sent, copy the transaction ID (also called the hash or TxID) from your exchange and submit it with the form on this page. Our team verifies every payment on the blockchain and confirms it with you.",
  },
];

export interface CryptoRegion {
  id: string;
  region: string;
  countries: string;
  exchanges: string[];
  notes: string[];
}

export const cryptoRegions: CryptoRegion[] = [
  {
    id: "united-states",
    region: "United States",
    countries: "All states",
    exchanges: ["Coinbase", "Kraken", "Gemini", "PayPal / Venmo (selected assets)"],
    notes: [
      "Fund by ACH bank transfer for the lowest fees; debit cards are faster but cost more.",
      "In New York, use a provider licensed by NYDFS (for example Coinbase or Gemini).",
      "PayPal and Venmo support only a few assets — check that the agreed asset and network are available before buying.",
    ],
  },
  {
    id: "canada",
    region: "Canada",
    countries: "All provinces",
    exchanges: ["Wealthsimple", "Kraken", "Coinbase", "Newton"],
    notes: [
      "Fund with Interac e-Transfer or bank transfer.",
      "Most Canadian platforms don't offer USDT; use USDC or BTC instead.",
    ],
  },
  {
    id: "united-kingdom",
    region: "United Kingdom",
    countries: "England, Scotland, Wales, Northern Ireland",
    exchanges: ["Coinbase", "Kraken", "Revolut"],
    notes: [
      "Use a provider registered with the FCA, and fund with a Faster Payments bank transfer.",
      "First-time buyers may face a 24-hour cooling-off period before their first purchase.",
      "Some UK banks block or cap payments to exchanges; Revolut and Monzo are usually smoother.",
    ],
  },
  {
    id: "europe",
    region: "Europe (EU & EEA)",
    countries: "Germany, France, Spain, Italy, Netherlands, Ireland, Portugal, Nordics and more",
    exchanges: ["Coinbase", "Kraken", "Bitpanda", "Bitstamp"],
    notes: [
      "Choose an exchange authorised under the EU's MiCA rules, and fund by SEPA bank transfer.",
      "USDT is generally not available to EU and EEA customers on regulated exchanges — pay with USDC, BTC or ETH.",
      "In Switzerland, Swissquote and Kraken are common choices.",
    ],
  },
  {
    id: "middle-east",
    region: "Middle East",
    countries: "United Arab Emirates, Bahrain",
    exchanges: ["Rain", "BitOasis"],
    notes: [
      "In Dubai, use a platform licensed by VARA; elsewhere in the UAE and Bahrain, look for a licensed local provider.",
      "Fund with a local AED or BHD bank transfer.",
    ],
  },
  {
    id: "east-asia",
    region: "East Asia",
    countries: "Japan, Hong Kong, South Korea",
    exchanges: ["bitFlyer, Coincheck (Japan)", "HashKey Exchange, OSL (Hong Kong)", "Upbit, Bithumb (South Korea)"],
    notes: [
      "Japanese exchanges offer few stablecoins — BTC or ETH is usually simplest.",
      "Exchanges in Japan and South Korea often require you to declare or pre-register the recipient before sending overseas, and South Korea restricts transfers to foreign addresses. Talk to your consultant first; a bank transfer or regional partner may be easier.",
      "In Hong Kong, use an SFC-licensed platform.",
    ],
  },
  {
    id: "southeast-asia",
    region: "Southeast Asia",
    countries: "Singapore, Philippines, Thailand, Indonesia, Malaysia",
    exchanges: [
      "Coinhako, Independent Reserve (Singapore)",
      "Coins.ph, PDAX (Philippines)",
      "Bitkub (Thailand)",
      "Indodax (Indonesia)",
      "Luno (Malaysia)",
    ],
    notes: [
      "Use a provider licensed by your country's regulator (for example MAS in Singapore, BSP in the Philippines, SEC Thailand).",
      "Fund with local bank transfer or e-wallet where offered.",
    ],
  },
  {
    id: "south-asia",
    region: "South Asia",
    countries: "India",
    exchanges: ["CoinDCX", "Mudrex"],
    notes: [
      "Use an exchange registered with India's Financial Intelligence Unit (FIU-IND).",
      "A 1% TDS is withheld on crypto transfers, and gains are taxed — factor this into the amount.",
    ],
  },
  {
    id: "oceania",
    region: "Australia & New Zealand",
    countries: "Australia, New Zealand",
    exchanges: ["Independent Reserve", "CoinSpot", "Swyftx", "Easy Crypto (New Zealand)"],
    notes: [
      "In Australia, use an exchange registered with AUSTRAC; fund with PayID or bank transfer.",
    ],
  },
  {
    id: "africa",
    region: "Africa",
    countries: "South Africa, Nigeria, Kenya, Ghana and more",
    exchanges: ["Luno, VALR (South Africa)", "Yellow Card (many African countries)", "Quidax, Busha (Nigeria)"],
    notes: [
      "Fund with local bank transfer or mobile money where the exchange supports it.",
      "Where buying crypto is difficult, ask your consultant about our regional payment intermediaries.",
    ],
  },
  {
    id: "latin-america",
    region: "Latin America",
    countries: "Mexico, Brazil, Argentina, Colombia",
    exchanges: ["Bitso (Mexico, Argentina, Brazil, Colombia)", "Mercado Bitcoin (Brazil)", "Lemon (Argentina)"],
    notes: [
      "Fund with SPEI (Mexico), Pix (Brazil) or local bank transfer.",
      "Stablecoins avoid exchange-rate swings between confirmation and payment.",
    ],
  },
];
