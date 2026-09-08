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
];

export function enabledCryptoPaymentOptions(): CryptoPaymentOption[] {
  return cryptoPaymentOptions.filter((o) => o.enabled && o.walletAddress);
}
