"use client";

import { FormEvent, useEffect, useState } from "react";
import QRCode from "qrcode";
import { enabledCryptoPaymentOptions, type CryptoPaymentOption } from "@/data/cryptoPayments";
import { submitCryptoPayment } from "@/lib/cryptoPaymentSubmissions";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-full border hairline px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ivory transition-colors hover:bg-ivory hover:text-ink"
    >
      {copied ? "Copied" : "Copy Address"}
    </button>
  );
}

function ActivePaymentFlow({ options }: { options: CryptoPaymentOption[] }) {
  const [selectedId, setSelectedId] = useState(options[0].id);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [error, setError] = useState("");

  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  useEffect(() => {
    const address = selected.walletAddress;
    if (!address) return;
    QRCode.toDataURL(address, { margin: 1, width: 220 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [selected.walletAddress]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected.walletAddress) return;
    setStatus("submitting");
    setError("");

    const result = await submitCryptoPayment({
      asset: selected.asset,
      network: selected.network,
      walletAddress: selected.walletAddress,
      transactionHash: txHash,
      payerName,
      payerEmail,
    });

    if (result.ok) {
      setStatus("submitted");
      track("crypto_payment_submitted", { asset: selected.asset, network: selected.network });
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  if (status === "submitted") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Payment Submitted — Pending Verification</p>
        <h3 className="font-display text-xl text-ivory md:text-2xl">Thank you</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          We&apos;ve recorded your transaction reference. Our team verifies each payment manually
          against the blockchain before confirming — we&apos;ll be in touch once that&apos;s done.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border hairline bg-charcoal p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setSelectedId(o.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              selectedId === o.id
                ? "border-gold text-gold"
                : "border-line text-stone hover:text-ivory"
            }`}
          >
            {o.displayName}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {qrDataUrl ? (
          // QR code encodes only the public wallet address — safe to display.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`QR code for ${selected.displayName} address`} width={140} height={140} />
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-wide text-stone">
            {selected.displayName} — {selected.network} network
          </p>
          <p className="mt-2 break-all font-mono text-sm text-ivory">{selected.walletAddress}</p>
          <div className="mt-3">
            <CopyAddressButton address={selected.walletAddress ?? ""} />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ivory">
        Send only {selected.asset} on the {selected.network} network to this address. Sending an
        unsupported asset or using the wrong network may result in permanent loss.
      </p>
      <p className="mt-2 text-sm text-stone">
        Send the exact amount agreed with your World Bridge Meridian consultant for your booking.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t hairline pt-6">
        <div>
          <label htmlFor="cp-hash" className="mb-2 block text-xs uppercase tracking-wide text-stone">
            Transaction Hash
          </label>
          <input
            id="cp-hash"
            required
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Paste your transaction hash"
            className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cp-name" className="mb-2 block text-xs uppercase tracking-wide text-stone">
              Name
            </label>
            <input
              id="cp-name"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
            />
          </div>
          <div>
            <label htmlFor="cp-email" className="mb-2 block text-xs uppercase tracking-wide text-stone">
              Email
            </label>
            <input
              id="cp-email"
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              className="w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "submitting" ? "Submitting…" : "Submit Payment Reference"}
        </button>
        {status === "error" ? <p className="text-xs text-red-400">{error}</p> : null}
      </form>
    </div>
  );
}

export function CryptoPaymentPanel() {
  const options = enabledCryptoPaymentOptions();

  if (options.length === 0 || !isSupabaseConfigured) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Crypto Payment</p>
        <h3 className="font-display text-xl text-ivory md:text-2xl">
          Not yet available for self-service payment
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          We&apos;re finalizing wallet setup for our supported assets. Once your journey is
          confirmed, your consultant will send you exact, booking-specific payment instructions
          directly.
        </p>
      </div>
    );
  }

  return <ActivePaymentFlow options={options} />;
}
