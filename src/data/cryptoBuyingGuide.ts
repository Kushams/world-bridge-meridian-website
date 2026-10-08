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
    body: "Choose an exchange that is licensed or registered where you live — pick your country above. Sign up with your legal name and complete identity verification (usually a photo ID and a selfie). Verification can take anywhere from minutes to a few days, so do it early.",
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

export interface CryptoCountryGuide {
  id: string;
  platforms: string[];
  steps: string[];
  note?: string;
}

function standardSteps(signUp: string, deposit: string): string[] {
  return [
    signUp,
    "Verify your ID.",
    deposit,
    "Buy the asset your consultant specified.",
    "Send it to the World Bridge Meridian address your consultant confirms, on the network they specify.",
  ];
}

export const cryptoCountryGuides: CryptoCountryGuide[] = [
  {
    id: "us",
    platforms: ["Coinbase", "Kraken", "Gemini"],
    steps: standardSteps(
      "Sign up on a US-regulated exchange (Coinbase, Kraken or Gemini).",
      "Deposit USD by ACH bank transfer (cheapest) or debit card.",
    ),
    note: "In New York, use a provider licensed by NYDFS — Coinbase and Gemini both are.",
  },
  {
    id: "ca",
    platforms: ["Wealthsimple", "Kraken", "Coinbase"],
    steps: standardSteps(
      "Sign up on a CSA-registered platform (Wealthsimple, Kraken or Coinbase).",
      "Deposit CAD by Interac e-Transfer or bank transfer.",
    ),
    note: "USDT isn't offered on most Canadian platforms — pay with USDC, BTC or ETH instead.",
  },
  {
    id: "mx",
    platforms: ["Bitso"],
    steps: standardSteps("Sign up on Bitso.", "Deposit MXN by SPEI bank transfer."),
  },
  {
    id: "br",
    platforms: ["Mercado Bitcoin", "Foxbit", "Binance"],
    steps: standardSteps(
      "Sign up on Mercado Bitcoin, Foxbit or Binance.",
      "Deposit BRL instantly by Pix.",
    ),
  },
  {
    id: "ar",
    platforms: ["Lemon", "Belo", "Ripio"],
    steps: standardSteps(
      "Sign up on Lemon, Belo or Ripio.",
      "Deposit ARS by bank transfer to your CVU.",
    ),
  },
  {
    id: "andean",
    platforms: ["Buda", "Binance"],
    steps: standardSteps(
      "Sign up on Buda or Binance.",
      "Deposit local currency (COP, CLP or PEN) by bank transfer.",
    ),
  },
  {
    id: "uk",
    platforms: ["Coinbase", "Kraken", "eToro"],
    steps: standardSteps(
      "Sign up on an FCA-registered exchange (Coinbase, Kraken) or eToro.",
      "Deposit GBP by bank transfer or card.",
    ),
    note: "On eToro, buying and sending are separate steps — you'll move the crypto into the eToro Money app before you can send it externally. Some UK banks limit payments to exchanges.",
  },
  {
    id: "eu",
    platforms: ["Coinbase", "Kraken", "Bitpanda", "Bitstamp"],
    steps: standardSteps(
      "Sign up on a MiCA-authorised exchange (Coinbase, Kraken, Bitpanda or Bitstamp).",
      "Deposit EUR (or your local currency) by SEPA bank transfer.",
    ),
    note: "USDT is generally not available to EU/EEA customers under MiCA — pay with USDC, BTC or ETH instead.",
  },
  {
    id: "ch",
    platforms: ["Swissquote", "Kraken", "Coinbase"],
    steps: standardSteps(
      "Sign up on Swissquote, Kraken or Coinbase.",
      "Deposit CHF or EUR by bank transfer.",
    ),
  },
  {
    id: "tr",
    platforms: ["BtcTurk", "Paribu"],
    steps: standardSteps(
      "Sign up on a Capital Markets Board–authorised platform (BtcTurk or Paribu).",
      "Deposit TRY by bank transfer from an account in your own name.",
    ),
  },
  {
    id: "gulf",
    platforms: ["Rain", "BitOasis"],
    steps: standardSteps(
      "Sign up on a licensed regional exchange (Rain or BitOasis).",
      "Deposit AED or BHD by bank transfer.",
    ),
  },
  {
    id: "jp",
    platforms: ["bitFlyer", "Coincheck", "bitbank"],
    steps: standardSteps(
      "Sign up on an FSA-registered exchange (bitFlyer, Coincheck or bitbank).",
      "Deposit JPY by bank transfer.",
    ),
    note: "Japanese exchanges ask for recipient details when you send abroad (the travel rule). The recipient is World Bridge Meridian, a business — ask your consultant if the exchange needs more.",
  },
  {
    id: "kr",
    platforms: ["Upbit", "Bithumb"],
    steps: standardSteps(
      "Sign up on Upbit or Bithumb and link a real-name bank account at the exchange's partner bank.",
      "Deposit KRW from that linked account.",
    ),
    note: "Korean exchanges require a real-name bank account and restrict withdrawals abroad — you may need to register the destination address first. Check with your consultant before buying.",
  },
  {
    id: "hk",
    platforms: ["HashKey Exchange", "OSL"],
    steps: standardSteps(
      "Sign up on an SFC-licensed exchange (HashKey Exchange or OSL).",
      "Deposit HKD by FPS or bank transfer.",
    ),
  },
  {
    id: "tw",
    platforms: ["MaiCoin", "BitoPro"],
    steps: standardSteps(
      "Sign up on an FSC-registered platform (MaiCoin or BitoPro).",
      "Deposit TWD by bank transfer.",
    ),
  },
  {
    id: "sg",
    platforms: ["Coinbase", "Independent Reserve", "Coinhako"],
    steps: standardSteps(
      "Sign up on a MAS-licensed exchange (Coinbase, Independent Reserve or Coinhako).",
      "Deposit SGD by PayNow or FAST bank transfer.",
    ),
  },
  {
    id: "ph",
    platforms: ["Coins.ph", "PDAX"],
    steps: standardSteps(
      "Sign up on a BSP-registered platform (Coins.ph or PDAX).",
      "Deposit PHP by InstaPay, bank transfer or e-wallet.",
    ),
  },
  {
    id: "th",
    platforms: ["Bitkub"],
    steps: standardSteps(
      "Sign up on a Thai SEC–licensed exchange such as Bitkub.",
      "Deposit THB by bank transfer.",
    ),
  },
  {
    id: "id",
    platforms: ["Indodax", "Tokocrypto"],
    steps: standardSteps(
      "Sign up on a registered exchange (Indodax or Tokocrypto).",
      "Deposit IDR by bank transfer or virtual account.",
    ),
  },
  {
    id: "my",
    platforms: ["Luno", "SINEGY"],
    steps: standardSteps(
      "Sign up on a Securities Commission–registered exchange (Luno or SINEGY).",
      "Deposit MYR by FPX or DuitNow bank transfer.",
    ),
  },
  {
    id: "in",
    platforms: ["CoinDCX", "CoinSwitch"],
    steps: standardSteps(
      "Sign up on an FIU-registered exchange (CoinDCX or CoinSwitch).",
      "Deposit INR by UPI or bank transfer.",
    ),
    note: "Indian tax rules, including 1% TDS on crypto transfers, apply — check with your tax adviser.",
  },
  {
    id: "cn",
    platforms: [],
    steps: [
      "Cryptocurrency trading has been restricted in mainland China since 2021, so we don't suggest a way to buy it there.",
      "Ask your consultant to arrange payment by bank transfer or through one of our regional payment intermediaries instead.",
    ],
  },
  {
    id: "au",
    platforms: ["Independent Reserve", "CoinSpot", "Swyftx"],
    steps: standardSteps(
      "Sign up on an AUSTRAC-registered exchange (Independent Reserve, CoinSpot or Swyftx).",
      "Deposit AUD by PayID or bank transfer.",
    ),
  },
  {
    id: "nz",
    platforms: ["Easy Crypto", "Independent Reserve", "Swyftx"],
    steps: standardSteps(
      "Sign up on a registered provider (Easy Crypto, Independent Reserve or Swyftx).",
      "Deposit NZD by bank transfer.",
    ),
  },
];

export interface CryptoCountryGroup {
  continent: string;
  countries: { name: string; guide: string }[];
}

const eu = (names: string[]) => names.map((name) => ({ name, guide: "eu" }));

export const cryptoCountryGroups: CryptoCountryGroup[] = [
  {
    continent: "North America",
    countries: [
      { name: "United States", guide: "us" },
      { name: "Canada", guide: "ca" },
      { name: "Mexico", guide: "mx" },
    ],
  },
  {
    continent: "South America",
    countries: [
      { name: "Argentina", guide: "ar" },
      { name: "Brazil", guide: "br" },
      { name: "Chile", guide: "andean" },
      { name: "Colombia", guide: "andean" },
      { name: "Peru", guide: "andean" },
    ],
  },
  {
    continent: "Europe",
    countries: [
      ...eu([
        "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
        "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy",
        "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway",
        "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
      ]),
      { name: "Switzerland", guide: "ch" },
      { name: "Türkiye", guide: "tr" },
      { name: "United Kingdom", guide: "uk" },
    ].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    continent: "Middle East",
    countries: [
      { name: "Bahrain", guide: "gulf" },
      { name: "United Arab Emirates", guide: "gulf" },
    ],
  },
  {
    continent: "Asia",
    countries: [
      { name: "China (mainland)", guide: "cn" },
      { name: "Hong Kong", guide: "hk" },
      { name: "India", guide: "in" },
      { name: "Indonesia", guide: "id" },
      { name: "Japan", guide: "jp" },
      { name: "Malaysia", guide: "my" },
      { name: "Philippines", guide: "ph" },
      { name: "Singapore", guide: "sg" },
      { name: "South Korea", guide: "kr" },
      { name: "Taiwan", guide: "tw" },
      { name: "Thailand", guide: "th" },
    ],
  },
  {
    continent: "Australia & Oceania",
    countries: [
      { name: "Australia", guide: "au" },
      { name: "New Zealand", guide: "nz" },
    ],
  },
];
