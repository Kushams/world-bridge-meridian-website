"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { enabledCryptoPaymentOptions } from "@/data/cryptoPayments";
import { WALLET_PAY_TOKENS } from "@/data/walletConnect";
import { canPayWithWallet, payWithWallet } from "@/lib/walletPay";

const field =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const label = "mb-2 block text-xs uppercase tracking-wide text-stone";

/**
 * Shared "pay with cryptocurrency" step for gift cards and Travel Credits:
 * choose asset and network, see our address and QR code, then paste the
 * transaction ID. The parent holds the chosen option and hash.
 */
export function CryptoPayStep({
  idPrefix,
  totalLabel,
  amountUsd,
  optionId,
  onOption,
  txHash,
  onTxHash,
}: {
  idPrefix: string;
  /** e.g. "US$1,000.00" or null while the amount is invalid. */
  totalLabel: string | null;
  /** The same total as a number, so a connected wallet can send it exactly. */
  amountUsd?: number | null;
  optionId: string;
  onOption: (id: string) => void;
  txHash: string;
  onTxHash: (v: string) => void;
}) {
  const options = enabledCryptoPaymentOptions();
  const assets = useMemo(() => Array.from(new Set(options.map((o) => o.asset))), [options]);
  const selected = options.find((o) => o.id === optionId) ?? null;
  const [asset, setAsset] = useState<string>(selected?.asset ?? "");
  const [qr, setQr] = useState<string | null>(null);
  const networks = options.filter((o) => o.asset === asset);
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const cents = amountUsd && amountUsd > 0 ? Math.round(amountUsd * 100) : 0;
  const walletReady = canPayWithWallet(selected) && cents > 0;

  async function payFromWallet() {
    if (!selected || !walletReady || walletBusy) return;
    setWalletBusy(true);
    setWalletMsg(null);
    try {
      const hash = await payWithWallet(selected, cents);
      onTxHash(hash);
      setWalletMsg({ ok: true, text: "Payment sent. Your transaction ID has been filled in below. Now submit the form so we can verify it." });
    } catch (e) {
      setWalletMsg({ ok: false, text: e instanceof Error ? e.message : "Something went wrong. Nothing was sent." });
    } finally {
      setWalletBusy(false);
    }
  }

  useEffect(() => {
    const addr = selected?.walletAddress;
    if (!addr) return;
    let live = true;
    QRCode.toDataURL(addr, { margin: 1, width: 200 })
      .then((u) => live && setQr(u))
      .catch(() => live && setQr(null));
    return () => {
      live = false;
    };
  }, [selected?.walletAddress]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-asset`} className={label}>Cryptocurrency</label>
        <select
          id={`${idPrefix}-asset`}
          value={asset}
          onChange={(e) => {
            const a = e.target.value;
            setAsset(a);
            const nets = options.filter((o) => o.asset === a);
            onOption(nets.length === 1 ? nets[0].id : "");
          }}
          className={field}
        >
          <option value="">Select a cryptocurrency</option>
          {assets.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      {networks.length > 1 ? (
        <div>
          <label htmlFor={`${idPrefix}-net`} className={label}>Network</label>
          <select id={`${idPrefix}-net`} value={optionId} onChange={(e) => onOption(e.target.value)} className={field}>
            <option value="">Select a network</option>
            {networks.map((o) => (
              <option key={o.id} value={o.id}>{o.network}</option>
            ))}
          </select>
        </div>
      ) : null}
      {selected ? (
        <div className="rounded-card border hairline p-5 text-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={`QR code for our ${selected.displayName} address`} width={160} height={160} className="mx-auto rounded-control bg-white" />
          ) : null}
          <p className="mt-4 text-xs uppercase tracking-wide text-stone">{selected.displayName} — {selected.network} network</p>
          <p className="mt-2 break-all font-mono text-sm text-ivory">{selected.walletAddress}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(selected.walletAddress ?? "")}
            className="mt-3 rounded-full border hairline px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory hover:bg-ivory hover:text-ink"
          >
            Copy address
          </button>
          <p className="mt-4 text-sm text-ivory">
            Send the equivalent of <b>{totalLabel ?? "your total"}</b> in {selected.asset} on the {selected.network} network.
          </p>
          <p className="mt-1 text-xs text-stone-dim">
            Use only this network. The wrong network can mean permanent loss. If the amount we receive differs from your order,
            we&apos;ll contact you before issuing anything.
          </p>
        </div>
      ) : null}
      {selected && canPayWithWallet(selected) ? (
        <div className="rounded-card border hairline p-5">
          <p className="text-sm font-semibold text-ivory">Or pay straight from your wallet</p>
          <p className="mt-1 text-xs text-stone leading-relaxed">
            Connect Trust Wallet, MetaMask or another wallet. It will ask you to approve sending {totalLabel ?? "your total"} in {selected.asset} on {WALLET_PAY_TOKENS[selected.id]?.chainName}.
            Check the amount and network in your wallet before you approve.
          </p>
          <button
            type="button"
            disabled={!walletReady || walletBusy}
            onClick={payFromWallet}
            className="mt-3 rounded-full bg-ivory px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50"
          >
            {walletBusy ? "Waiting for your wallet…" : "Pay with my wallet"}
          </button>
          {!walletReady ? <p className="mt-2 text-xs text-stone-dim">Choose a valid amount above first.</p> : null}
          {walletMsg ? <p role="status" className={`mt-3 text-xs ${walletMsg.ok ? "text-gold" : "text-red-500"}`}>{walletMsg.text}</p> : null}
        </div>
      ) : null}
      <div>
        <label htmlFor={`${idPrefix}-hash`} className={label}>Transaction ID (after you&apos;ve sent payment)</label>
        <input id={`${idPrefix}-hash`} value={txHash} onChange={(e) => onTxHash(e.target.value)} placeholder="Paste the transaction hash / TxID" className={field} />
      </div>
    </div>
  );
}
