import { WALLETCONNECT_PROJECT_ID, WALLET_PAY_TOKENS } from "@/data/walletConnect";
import type { CryptoPaymentOption } from "@/data/cryptoPayments";

const HEX_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/** ERC-20 transfer(address,uint256) call data. */
export function encodeTransfer(to: string, units: bigint): string {
  if (!HEX_ADDRESS.test(to)) throw new Error("Invalid recipient address");
  if (units <= BigInt(0)) throw new Error("Invalid amount");
  return `0xa9059cbb${to.slice(2).toLowerCase().padStart(64, "0")}${units.toString(16).padStart(64, "0")}`;
}

/** US cents -> the token's smallest unit (every supported token has 6 decimals). */
export function centsToUnits(cents: number, decimals: number): bigint {
  if (!Number.isInteger(cents) || cents <= 0) throw new Error("Invalid amount");
  return BigInt(cents) * BigInt(10) ** BigInt(decimals - 2);
}

export function canPayWithWallet(option: CryptoPaymentOption | null): boolean {
  return Boolean(option?.walletAddress && HEX_ADDRESS.test(option.walletAddress) && WALLET_PAY_TOKENS[option.id] && WALLETCONNECT_PROJECT_ID);
}

export class WalletPayError extends Error {
  constructor(message: string, readonly cancelled = false) {
    super(message);
  }
}

/**
 * Opens WalletConnect, lets the customer pick their wallet, and asks it to send exactly `cents` US
 * dollars of the option's stablecoin to our address. Resolves with the transaction hash. The library is
 * loaded only when the button is pressed, so it adds nothing to normal page loads.
 */
export async function payWithWallet(option: CryptoPaymentOption, cents: number): Promise<string> {
  const token = WALLET_PAY_TOKENS[option.id];
  if (!token || !option.walletAddress || !HEX_ADDRESS.test(option.walletAddress)) throw new WalletPayError("This option can't be paid from a connected wallet. Please send to the address shown.");
  const data = encodeTransfer(option.walletAddress, centsToUnits(cents, token.decimals));

  const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
  const origin = window.location.origin;
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [token.chainId],
    showQrModal: true,
    metadata: {
      name: "World Bridge Meridian",
      description: "Bespoke travel group. Pay for gift cards and Travel Credits.",
      url: origin,
      icons: [`${origin}/icon.svg`],
    },
  });
  try {
    await provider.connect();
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
    const from = accounts?.[0];
    if (!from) throw new WalletPayError("No account was shared from your wallet.");
    const hash = (await provider.request({
      method: "eth_sendTransaction",
      params: [{ from, to: token.contract, data, value: "0x0" }],
    })) as string;
    return hash;
  } catch (e) {
    if (e instanceof WalletPayError) throw e;
    const err = e as { code?: number; message?: string };
    if (err?.code === 4001 || /reject|denied|cancel|closed|user/i.test(err?.message ?? "")) {
      throw new WalletPayError("Cancelled. Nothing was sent.", true);
    }
    throw new WalletPayError("We couldn't complete that in your wallet. Nothing was sent unless your wallet says so. You can still send to the address shown.");
  } finally {
    provider.disconnect().catch(() => {});
  }
}
