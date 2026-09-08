/**
 * Centralized crypto payment configuration.
 *
 * ONLY PUBLIC WALLET ADDRESSES may ever go in this file — never a private
 * key or seed phrase. Every entry below is a genuine placeholder: World
 * Bridge Meridian has not yet provided confirmed wallet addresses, so every
 * option is `enabled: false` and `walletAddress: null`. Do not invent an
 * address. Flip `enabled` to `true` and fill in `walletAddress` only once
 * WBM has confirmed the exact address and network in writing — sending
 * funds to the wrong network can be unrecoverable, so this is treated as a
 * real operational decision, not a content edit.
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
    walletAddress: null,
    enabled: false,
    notes: "[REQUIRES WBM INPUT] Confirmed BTC receiving address needed.",
  },
  {
    id: "usdt-network-tbd",
    asset: "USDT",
    network: "[REQUIRES WBM INPUT]",
    displayName: "Tether (USDT)",
    walletAddress: null,
    enabled: false,
    notes:
      "[REQUIRES WBM INPUT] USDT exists on multiple networks (e.g. Ethereum, Tron, Polygon) with different, incompatible addresses. WBM must confirm which network(s) it actually holds a wallet on before this can be enabled.",
  },
  {
    id: "sol-solana",
    asset: "SOL",
    network: "Solana",
    displayName: "Solana (SOL)",
    walletAddress: null,
    enabled: false,
    notes: "[REQUIRES WBM INPUT] Confirmed SOL receiving address needed.",
  },
];

export function enabledCryptoPaymentOptions(): CryptoPaymentOption[] {
  return cryptoPaymentOptions.filter((o) => o.enabled && o.walletAddress);
}
