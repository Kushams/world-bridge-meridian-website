"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { company } from "@/data/company";
import { enabledCryptoPaymentOptions } from "@/data/cryptoPayments";
import { submitForm } from "@/lib/formSubmissions";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { AccountGate } from "@/components/account/AccountGate";
import { CryptoPayStep } from "@/components/payments/CryptoPayStep";
import { track } from "@/lib/analytics";
import { CREDIT_MAX, CREDIT_MIN, CREDIT_PRESETS, fmtUsd } from "@/lib/credits";
import { usd } from "@/lib/giftCards";

const field =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const label = "mb-2 block text-xs uppercase tracking-wide text-stone";

/** Buy Travel Credits: account required, pay in crypto, our team verifies and adds them. */
export function CreditsPurchase() {
  if (!isSupabaseConfigured || enabledCryptoPaymentOptions().length === 0) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center">
        <h3 className="font-display text-xl text-ivory">Online purchase isn&apos;t open yet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          To buy Travel Credits now, email <a className="underline" href={`mailto:${company.email}`}>{company.email}</a> and your consultant will arrange it.
        </p>
      </div>
    );
  }
  return (
    <AccountGate
      title="Sign in to buy Travel Credits"
      intro="Credits are added to your account, so you need one first. Sign up with your email or Google. It takes a minute."
    >
      <CreditsForm />
    </AccountGate>
  );
}

function CreditsForm() {
  const { user, profile } = useAuth();
  const [preset, setPreset] = useState<number | null>(1000);
  const [amountText, setAmountText] = useState("1000");
  const [optionId, setOptionId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [agree, setAgree] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const email = user?.email ?? "";

  const amount = Number(amountText);
  const amountOk = Number.isFinite(amount) && amount >= CREDIT_MIN && amount <= CREDIT_MAX && Math.round(amount * 100) === amount * 100;
  const selected = enabledCryptoPaymentOptions().find((o) => o.id === optionId) ?? null;

  if (status === "sent") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Order received</p>
        <h3 className="font-display text-2xl text-ivory md:text-3xl">Thank you</h3>
        <p className="mx-auto mt-4 max-w-lg text-sm text-stone leading-relaxed">
          We&apos;ve received your purchase of {fmtUsd(amount)} in Travel Credits. Our team now verifies your payment on the
          blockchain. As soon as it&apos;s confirmed, the credits appear in My World Bridge and we email you at {email}.
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!amountOk) return setError(`Please choose an amount between ${fmtUsd(CREDIT_MIN)} and ${fmtUsd(CREDIT_MAX)}.`);
    if (!selected) return setError("Please choose the cryptocurrency and network you sent payment on.");
    if (!txHash.trim()) return setError("Please paste the transaction ID from your payment.");
    if (!agree) return setError("Please tick the box to accept the Travel Credit terms.");
    setStatus("sending");
    const result = await submitForm({
      formType: "travel-credits",
      name: profile?.full_name ?? "",
      email,
      subject: `Travel Credits purchase — ${fmtUsd(amount)} (${selected.asset} ${selected.network})`,
      payload: {
        amount: String(amount),
        payment_asset: selected.asset,
        payment_network: selected.network,
        payment_address: selected.walletAddress,
        transaction_hash: txHash.trim(),
        accepted_credit_terms: "yes",
      },
      turnstileToken: token,
    });
    setReset((n) => n + 1);
    if (result.ok) {
      setStatus("sent");
      track("form_submitted", { form: "travel-credits" });
    } else {
      setStatus("idle");
      setError(result.error || "We couldn't send your order. Your payment is safe — please email us the transaction ID.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8">
      <section className="space-y-4">
        <h3 className="font-display text-xl text-ivory md:text-2xl"><span className="mr-2 text-gold">1.</span>Choose an amount</h3>
        <p className="text-sm text-stone">1 Travel Credit = US$1. Credits you buy never expire.</p>
        <div className="grid grid-cols-3 gap-3">
          {CREDIT_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={preset === p}
              onClick={() => {
                setPreset(p);
                setAmountText(String(p));
              }}
              className={`rounded-control border px-3 py-3 text-sm ${preset === p ? "border-gold bg-gold/10 text-ivory" : "border-line text-stone hover:border-gold"}`}
            >
              {fmtUsd(p)}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="tc-amount" className={label}>Or enter an amount (USD)</label>
          <input
            id="tc-amount"
            inputMode="decimal"
            value={amountText}
            onChange={(e) => {
              setAmountText(e.target.value.replace(/[^0-9.]/g, ""));
              setPreset(null);
            }}
            className={field}
          />
          <p className="mt-1 text-xs text-stone-dim">
            Between {fmtUsd(CREDIT_MIN)} and {fmtUsd(CREDIT_MAX)} per purchase. There is no limit on how many credits you can hold.
          </p>
        </div>
        <dl className="flex items-baseline justify-between rounded-card border hairline p-5 font-display text-lg">
          <dt className="text-ivory">Total</dt>
          <dd className="text-gold">{amountOk ? usd(amount) : "—"}</dd>
        </dl>
      </section>

      <section className="space-y-4 border-t hairline pt-8">
        <h3 className="font-display text-xl text-ivory md:text-2xl"><span className="mr-2 text-gold">2.</span>Pay with cryptocurrency</h3>
        <CryptoPayStep idPrefix="tc" totalLabel={amountOk ? fmtUsd(amount) : null} optionId={optionId} onOption={setOptionId} txHash={txHash} onTxHash={setTxHash} />
      </section>

      <div className="space-y-4 border-t hairline pt-8">
        <label className="flex gap-3 text-sm text-stone leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#a8863b]" />
          <span>
            I acknowledge and agree to the <Link href="/travel-credits#credit-terms" target="_blank" className="text-ivory underline underline-offset-4">Travel Credit terms</Link>.
          </span>
        </label>
        <TurnstileWidget onToken={setToken} resetKey={reset} />
        {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
        <button type="submit" disabled={status === "sending"} className="w-full rounded-full bg-ivory px-8 py-4 text-sm font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50 sm:w-auto">
          {status === "sending" ? "Sending…" : "Buy Travel Credits"}
        </button>
      </div>
    </form>
  );
}
