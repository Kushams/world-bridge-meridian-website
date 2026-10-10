/**
 * Centralized crypto payment configuration.
 *
 * ONLY PUBLIC WALLET ADDRESSES may ever go in this file — never a private
 * key or seed phrase. Confirmed by WBM. Addresses on the same underlying
 * chain type are intentionally identical (e.g. Ethereum/Base/BSC all share
 * one EVM address; Solana-based tokens share one Solana address) — that's
 * expected, not a mistake. Flip `enabled` to `false` and clear
 * `walletAddress` if a given asset/network is ever paused.
 */

export interface CryptoPaymentOption {
  /** Stable key, used as the option's id in the UI and in submitted records. */
  id: string;
  asset: string;
  network: string;
  displayName: string;
  walletAddress: string | null;
  enabled: boolean;
  notes: string;
}

export const cryptoPaymentOptions: CryptoPaymentOption[] = [
  {
    id: "btc-bitcoin",
    asset: "BTC",
    network: "Bitcoin",
    displayName: "Bitcoin (BTC)",
    walletAddress: "bc1qvdym76f5zpn5njd8hsm4gvvpfzjpegw8s2p9g6",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "eth-ethereum",
    asset: "ETH",
    network: "Ethereum",
    displayName: "Ethereum (ETH)",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "eth-base",
    asset: "ETH",
    network: "Base",
    displayName: "Ethereum (ETH) — Base",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdt-tron",
    asset: "USDT",
    network: "Tron (TRC20)",
    displayName: "Tether (USDT) — Tron",
    walletAddress: "TKBJb4LHXEKcnRSYmVd8JqgvXXJxcwUrsz",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdt-solana",
    asset: "USDT",
    network: "Solana",
    displayName: "Tether (USDT) — Solana",
    walletAddress: "3fg633BoCY7DrHsSff5HFXtTsazUs2vvvipmWZQmZ8Uh",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-ethereum",
    asset: "USDC",
    network: "Ethereum (ERC20)",
    displayName: "USD Coin (USDC) — Ethereum",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-bsc",
    asset: "USDC",
    network: "BNB Smart Chain (BEP20)",
    displayName: "USD Coin (USDC) — BNB Smart Chain",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-base",
    asset: "USDC",
    network: "Base",
    displayName: "USD Coin (USDC) — Base",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-solana",
    asset: "USDC",
    network: "Solana",
    displayName: "USD Coin (USDC) — Solana",
    walletAddress: "3fg633BoCY7DrHsSff5HFXtTsazUs2vvvipmWZQmZ8Uh",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "sol-solana",
    asset: "SOL",
    network: "Solana",
    displayName: "Solana (SOL)",
    walletAddress: "3fg633BoCY7DrHsSff5HFXtTsazUs2vvvipmWZQmZ8Uh",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdt-ethereum",
    asset: "USDT",
    network: "Ethereum (ERC20)",
    displayName: "Tether (USDT) — Ethereum",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdt-bsc",
    asset: "USDT",
    network: "BNB Smart Chain (BEP20)",
    displayName: "Tether (USDT) — BNB Smart Chain",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-arbitrum",
    asset: "USDC",
    network: "Arbitrum One",
    displayName: "USD Coin (USDC) — Arbitrum",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-polygon",
    asset: "USDC",
    network: "Polygon",
    displayName: "USD Coin (USDC) — Polygon",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "usdc-optimism",
    asset: "USDC",
    network: "Optimism",
    displayName: "USD Coin (USDC) — Optimism",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "bnb-bsc",
    asset: "BNB",
    network: "BNB Smart Chain (BEP20)",
    displayName: "BNB (BNB) — BNB Smart Chain",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "pol-polygon",
    asset: "POL",
    network: "Polygon",
    displayName: "Polygon (POL)",
    walletAddress: "0xDF425b9854e0EBa3C79b75A57b08c4016E03A269",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "trx-tron",
    asset: "TRX",
    network: "Tron",
    displayName: "Tron (TRX)",
    walletAddress: "TKBJb4LHXEKcnRSYmVd8JqgvXXJxcwUrsz",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "ltc-litecoin",
    asset: "LTC",
    network: "Litecoin",
    displayName: "Litecoin (LTC)",
    walletAddress: "LWUeUmE9RStay2EbtpQFwzBQ8bTmCXm5Tc",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "xrp-xrpl",
    asset: "XRP",
    network: "XRP Ledger",
    displayName: "XRP (XRP)",
    walletAddress: "rpvrfnJqrSQvTtfionwyKChwEcF2BGUD2D",
    enabled: true,
    notes: "Confirmed by WBM. No destination tag is needed.",
  },
  {
    id: "doge-dogecoin",
    asset: "DOGE",
    network: "Dogecoin",
    displayName: "Dogecoin (DOGE)",
    walletAddress: "D9ZvJd3wk783FTAZ5XVcPmDSd6iqQRNQAU",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
  {
    id: "bch-bitcoincash",
    asset: "BCH",
    network: "Bitcoin Cash",
    displayName: "Bitcoin Cash (BCH)",
    walletAddress: "qzhpljrj3kljh9vm0lttxz5f0fl47y66zsu0rkqtdn",
    enabled: true,
    notes: "Confirmed by WBM.",
  },
];

export function enabledCryptoPaymentOptions(): CryptoPaymentOption[] {
  return cryptoPaymentOptions.filter((o) => o.enabled && o.walletAddress);
}
