"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { company } from "@/data/company";
import { enabledCryptoPaymentOptions, type CryptoPaymentOption } from "@/data/cryptoPayments";
import { submitCryptoPayment, type SubmissionFailure } from "@/lib/cryptoPaymentSubmissions";
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

type Step = "currency" | "network" | "details";

function CheckoutSteps({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "currency", label: "1. Currency" },
    { key: "network", label: "2. Network" },
    { key: "details", label: "3. Send Payment" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-stone-dim">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-2">
          <span className={s.key === current ? "text-gold" : ""}>{s.label}</span>
          {i < steps.length - 1 ? <span aria-hidden="true">›</span> : null}
        </span>
      ))}
    </div>
  );
}

function PaymentDetails({
  selected,
  onChangeCurrency,
  onChangeNetwork,
  showNetworkBack,
}: {
  selected: CryptoPaymentOption;
  onChangeCurrency: () => void;
  onChangeNetwork: () => void;
  showNetworkBack: boolean;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState<SubmissionFailure>("unavailable");

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
      setFailure(result.kind);
    }
  }

  // Someone reaching this form has usually already sent funds, so a failed
  // submission must never be a dead end — they get a prefilled email with the
  // same reference our team would have received.
  const fallbackMailto = `mailto:${company.email}?subject=${encodeURIComponent(
    `Crypto payment reference — ${selected.asset} (${selected.network})`,
  )}&body=${encodeURIComponent(
    [
      `Asset: ${selected.asset}`,
      `Network: ${selected.network}`,
      `Wallet address: ${selected.walletAddress ?? ""}`,
      `Transaction hash: ${txHash}`,
      `Name: ${payerName}`,
      `Email: ${payerEmail}`,
    ].join("\n"),
  )}`;

  if (status === "submitted") {
    return (
      <div className="text-center">
        <p className="eyebrow mb-3">Payment Submitted — Pending Verification</p>
        <h3 className="font-display text-xl text-ivory md:text-2xl">Thank you</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          Your transaction reference has been forwarded to our team for verification. A World
          Bridge Meridian consultant will follow up with you directly once it&apos;s been checked
          against the blockchain and confirmed.
        </p>
        {payerEmail ? (
          <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
            We&apos;ve also emailed a confirmation to {payerEmail} — that email confirms we
            received your reference, not that the payment itself has been verified yet.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 text-xs">
        <button
          type="button"
          onClick={onChangeCurrency}
          className="text-stone-dim underline transition-colors hover:text-ivory"
        >
          ← Change currency
        </button>
        {showNetworkBack ? (
          <button
            type="button"
            onClick={onChangeNetwork}
            className="text-stone-dim underline transition-colors hover:text-ivory"
          >
            ← Change network
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {qrDataUrl ? (
          // QR code encodes only the public wallet address — safe to display.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={`QR code for ${selected.displayName} address`}
            width={140}
            height={140}
          />
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
          className="w-full rounded-full bg-ivory px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {status === "submitting" ? "Submitting…" : "Submit Payment Reference"}
        </button>
        {status === "error" ? (
          <div className="space-y-2">
            <p className="text-xs text-red-400">
              {failure === "duplicate"
                ? "We've already received this transaction reference — it's with our team for verification, no need to submit it again."
                : failure === "throttled"
                  ? error
                  : `We couldn't record your reference automatically (${error}). Your payment is unaffected — send us the reference directly and our team will verify it.`}
            </p>
            {failure === "unavailable" ? (
              <a href={fallbackMailto} className="inline-block text-xs text-gold underline">
                Email your transaction reference to {company.email}
              </a>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function Checkout({ options }: { options: CryptoPaymentOption[] }) {
  const assets = useMemo(() => {
    const order: string[] = [];
    const byAsset = new Map<string, CryptoPaymentOption[]>();
    for (const o of options) {
      if (!byAsset.has(o.asset)) {
        byAsset.set(o.asset, []);
        order.push(o.asset);
      }
      byAsset.get(o.asset)!.push(o);
    }
    return order.map((asset) => ({ asset, options: byAsset.get(asset)! }));
  }, [options]);

  const [step, setStep] = useState<Step>("currency");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const assetOptions = assets.find((a) => a.asset === selectedAsset)?.options ?? [];
  const selected = assetOptions.find((o) => o.id === selectedId) ?? null;

  function chooseAsset(asset: string) {
    const opts = assets.find((a) => a.asset === asset)?.options ?? [];
    setSelectedAsset(asset);
    if (opts.length === 1) {
      setSelectedId(opts[0].id);
      setStep("details");
    } else {
      setSelectedId(null);
      setStep("network");
    }
  }

  function chooseNetwork(id: string) {
    setSelectedId(id);
    setStep("details");
  }

  return (
    <div className="rounded-card border hairline bg-charcoal p-6 md:p-8">
      <CheckoutSteps current={step} />

      {step === "currency" ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-stone">Select a cryptocurrency to pay with.</p>
          <div className="flex flex-wrap gap-2">
            {assets.map((a) => (
              <button
                key={a.asset}
                type="button"
                onClick={() => chooseAsset(a.asset)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone transition-colors hover:border-gold hover:text-gold"
              >
                {a.asset}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === "network" ? (
        <div className="mt-6">
          <p className="mb-3 text-sm text-stone">
            {selectedAsset} is available on more than one network — select the one you&apos;re
            sending from.
          </p>
          <div className="flex flex-wrap gap-2">
            {assetOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => chooseNetwork(o.id)}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone transition-colors hover:border-gold hover:text-gold"
              >
                {o.network}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep("currency")}
            className="mt-4 text-xs text-stone-dim underline transition-colors hover:text-ivory"
          >
            ← Change currency
          </button>
        </div>
      ) : null}

      {step === "details" && selected ? (
        <div className="mt-6">
          <PaymentDetails
            selected={selected}
            onChangeCurrency={() => {
              setStep("currency");
              setSelectedAsset(null);
              setSelectedId(null);
            }}
            onChangeNetwork={() => setStep("network")}
            showNetworkBack={assetOptions.length > 1}
          />
        </div>
      ) : null}
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

  return <Checkout options={options} />;
}
