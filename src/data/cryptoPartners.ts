/**
 * Crypto exchanges and wallets World Bridge Meridian works with. The owner confirmed these
 * as existing partners (Oct 2026) and supplied the logo files in public/images/partners.
 * Logos belong to their owners; follow each company's brand-use guidelines.
 * `wordmark` logos are wide artwork with no background: "onDark" is light artwork (dark tile),
 * "onLight" is dark artwork (white tile).
 */
export type CryptoPartner = { name: string; logo: string; wordmark?: "onDark" | "onLight" };

export const cryptoPartnerExchanges: CryptoPartner[] = [
  { name: "Binance", logo: "/images/partners/binance.png" },
  { name: "Coinbase", logo: "/images/partners/coinbase.png" },
  { name: "Crypto.com", logo: "/images/partners/crypto-com.svg", wordmark: "onDark" },
  { name: "Bitget", logo: "/images/partners/bitget.png" },
  { name: "Kraken", logo: "/images/partners/kraken.png" },
  { name: "OKX", logo: "/images/partners/okx.png" },
  { name: "Bybit", logo: "/images/partners/bybit.png" },
  { name: "KuCoin", logo: "/images/partners/kucoin.png" },
];

export const cryptoPartnerWallets: CryptoPartner[] = [
  { name: "MetaMask", logo: "/images/partners/metamask.png" },
  { name: "Trust Wallet", logo: "/images/partners/trust-wallet.svg", wordmark: "onDark" },
  { name: "Phantom", logo: "/images/partners/phantom.png" },
  { name: "Ledger", logo: "/images/partners/ledger.png" },
  { name: "Exodus", logo: "/images/partners/exodus.svg", wordmark: "onLight" },
  { name: "Rainbow", logo: "/images/partners/rainbow.png" },
];
