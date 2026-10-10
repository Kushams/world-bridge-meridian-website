/**
 * WalletConnect (Reown) project ID. This is a PUBLIC identifier by design: it ends up in the site's
 * code. It is not a secret and gives no access to anything. Domain allowlisting for it is set in the
 * Reown dashboard. Override with NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID if it ever changes.
 */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b7c166c03d612df364fa9f1f6408b318";

/**
 * Stablecoin payments the "Pay with my wallet" button can send. Contract addresses come from the issuers:
 * USDC from Circle's official contract list (developers.circle.com/stablecoins/usdc-contract-addresses),
 * USDT on Ethereum from Tether's official list (tether.to/en/supported-protocols). All use 6 decimals.
 * Other options (native coins, USDT on other chains, BNB Smart Chain, Solana, Tron...) keep the
 * address + QR flow: add one here only after checking its contract with the issuer.
 */
export interface WalletPayToken {
  chainId: number;
  chainName: string;
  contract: string;
  decimals: 6;
}

export const WALLET_PAY_TOKENS: Record<string, WalletPayToken> = {
  "usdc-ethereum": { chainId: 1, chainName: "Ethereum", contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  "usdc-base": { chainId: 8453, chainName: "Base", contract: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  "usdc-arbitrum": { chainId: 42161, chainName: "Arbitrum One", contract: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
  "usdc-optimism": { chainId: 10, chainName: "Optimism", contract: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
  "usdc-polygon": { chainId: 137, chainName: "Polygon", contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
  "usdt-ethereum": { chainId: 1, chainName: "Ethereum", contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
};
