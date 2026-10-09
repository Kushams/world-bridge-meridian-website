"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { company } from "@/data/company";
import { enabledCryptoPaymentOptions } from "@/data/cryptoPayments";
import { submitForm } from "@/lib/formSubmissions";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { AccountGate } from "@/components/account/AccountGate";
import { CryptoPayStep } from "@/components/payments/CryptoPayStep";
import { GiftCardPreview } from "./GiftCardPreview";
import { track } from "@/lib/analytics";
import { GIFT_DESIGNS, GIFT_MAX_QTY, GIFT_MAX_TOTAL, GIFT_MIN, GIFT_PRESETS, usd, type GiftDesign } from "@/lib/giftCards";

const field =
  "w-full rounded-control border border-line bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-stone-dim outline-none focus:border-gold";
const label = "mb-2 block text-xs uppercase tracking-wide text-stone";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-t hairline pt-8">
      <h3 className="font-display text-xl text-ivory md:text-2xl">
        <span className="mr-2 text-gold">{n}.</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Buying a gift card needs an account: sign up or sign in first (email or Google). */
export function GiftCardPurchase() {
  if (!isSupabaseConfigured || enabledCryptoPaymentOptions().length === 0) {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center">
        <p className="eyebrow mb-3">Gift cards</p>
        <h3 className="font-display text-xl text-ivory">Online purchase isn&apos;t open yet</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone leading-relaxed">
          To buy a gift card now, email{" "}
          <a className="underline" href={`mailto:${company.email}`}>{company.email}</a> and your consultant will arrange it.
        </p>
      </div>
    );
  }
  return (
    <AccountGate
      title="Create an account to buy a gift card"
      intro="It takes a minute. Your account keeps your orders, receipts and Travel Credits together, and lets us verify your payment securely."
    >
      <GiftCardForm />
    </AccountGate>
  );
}

function GiftCardForm() {
  const { user, profile } = useAuth();
  const [design, setDesign] = useState<GiftDesign>("classic");
  const [preset, setPreset] = useState<number | null>(500);
  const [amountText, setAmountText] = useState("500");
  const [qtyText, setQtyText] = useState("1");
  const [first, setFirst] = useState(() => (profile?.full_name ?? "").split(" ")[0] ?? "");
  const [last, setLast] = useState(() => (profile?.full_name ?? "").split(" ").slice(1).join(" "));
  const email = user?.email ?? "";
  const [asGift, setAsGift] = useState(false);
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [msg, setMsg] = useState("");
  const [optionId, setOptionId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [agree, setAgree] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [reset, setReset] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const top = useRef<HTMLDivElement>(null);

  const selected = enabledCryptoPaymentOptions().find((o) => o.id === optionId) ?? null;
  const amount = Number(amountText);
  const qty = Number(qtyText);
  const total = amount * qty;
  const amountOk = Number.isFinite(amount) && amount >= GIFT_MIN && Math.round(amount * 100) === amount * 100;
  const qtyOk = Number.isInteger(qty) && qty >= 1 && qty <= GIFT_MAX_QTY;
  const totalOk = amountOk && qtyOk && total <= GIFT_MAX_TOTAL;

  if (status === "sent") {
    return (
      <div className="rounded-card border hairline bg-charcoal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Order received</p>
        <h3 className="font-display text-2xl text-ivory md:text-3xl">Thank you</h3>
        <p className="mx-auto mt-4 max-w-lg text-sm text-stone leading-relaxed">
          We&apos;ve received your order for {qty} gift card{qty > 1 ? "s" : ""} of {usd(amount)}. Our team now verifies your payment on
          the blockchain. As soon as it&apos;s confirmed, the gift card code{qty > 1 ? "s are" : " is"} emailed to {asGift ? rEmail : email}.
          You&apos;ll get a confirmation at {email} too.
        </p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!totalOk) return setError(`Please choose an amount of at least ${usd(GIFT_MIN)}, and a total no higher than ${usd(GIFT_MAX_TOTAL)}.`);
    if (!selected) return setError("Please choose the cryptocurrency and network you sent payment on.");
    if (!txHash.trim()) return setError("Please paste the transaction ID from your payment.");
    if (!agree) return setError("Please tick the box to accept the gift card terms.");
    if (asGift && (!rName.trim() || !rEmail.trim())) return setError("Please enter the recipient's name and email.");

    setStatus("sending");
    const result = await submitForm({
      formType: "gift-card",
      name: `${first} ${last}`.trim(),
      email,
      subject: `Gift card order — ${qty} × ${usd(amount)} (${selected.asset} ${selected.network})`,
      message: asGift ? msg.trim() || undefined : undefined,
      payload: {
        amount: String(amount),
        quantity: String(qty),
        total_usd: String(total),
        design,
        send_as_gift: asGift ? "yes" : "no",
        recipient_name: asGift ? rName.trim() : "",
        recipient_email: asGift ? rEmail.trim() : "",
        gift_message: asGift ? msg.trim() : "",
        payment_asset: selected.asset,
        payment_network: selected.network,
        payment_address: selected.walletAddress,
        transaction_hash: txHash.trim(),
        accepted_gift_card_terms: "yes",
      },
      turnstileToken: token,
    });
    setReset((n) => n + 1);
    if (result.ok) {
      setStatus("sent");
      track("form_submitted", { form: "gift-card" });
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setStatus("error");
      setError(result.error || "We couldn't send your order. Your payment is safe — please email us the transaction ID.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div ref={top} className="space-y-8">
        <Step n={1} title="Choose a design and amount">
          <div role="radiogroup" aria-label="Design" className="flex flex-wrap gap-3">
            {GIFT_DESIGNS.map((d) => (
              <button
                key={d.key}
                type="button"
                role="radio"
                aria-checked={design === d.key}
                onClick={() => setDesign(d.key)}
                className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide ${
                  design === d.key ? "border-gold text-gold" : "border-line text-ivory-dim hover:border-gold"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GIFT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={preset === p}
                onClick={() => {
                  setPreset(p);
                  setAmountText(String(p));
                }}
                className={`rounded-control border px-3 py-3 text-sm ${
                  preset === p ? "border-gold bg-gold/10 text-ivory" : "border-line text-stone hover:border-gold"
                }`}
              >
                {usd(p).replace(".00", "")}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gc-amount" className={label}>Or enter an amount (USD)</label>
              <input
                id="gc-amount"
                inputMode="decimal"
                value={amountText}
                onChange={(e) => {
                  setAmountText(e.target.value.replace(/[^0-9.]/g, ""));
                  setPreset(null);
                }}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="gc-qty" className={label}>Number of gift cards</label>
              <input id="gc-qty" inputMode="numeric" value={qtyText} onChange={(e) => setQtyText(e.target.value.replace(/\D/g, ""))} className={field} />
            </div>
          </div>
          <p className="text-xs text-stone-dim">
            Minimum {usd(GIFT_MIN)} per card. The total of all cards must be between {usd(GIFT_MIN)} and {usd(GIFT_MAX_TOTAL)}.
            For higher amounts, email <a className="underline" href={`mailto:${company.email}`}>{company.email}</a>.
          </p>
        </Step>

        <Step n={2} title="Your details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gc-first" className={label}>First name</label>
              <input id="gc-first" required autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor="gc-last" className={label}>Last name</label>
              <input id="gc-last" required autoComplete="family-name" value={last} onChange={(e) => setLast(e.target.value)} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="gc-email" className={label}>Account email</label>
            <input id="gc-email" type="email" readOnly value={email} className={`${field} opacity-70`} />
            <p className="mt-1 text-xs text-stone-dim">Your receipt goes to your account email.</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-ivory">
            <input type="checkbox" checked={asGift} onChange={(e) => setAsGift(e.target.checked)} className="h-4 w-4 accent-[#a8863b]" />
            Send as a gift to someone else
          </label>
          {asGift ? (
            <div className="space-y-4 rounded-card border hairline p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gc-rname" className={label}>Recipient&apos;s name</label>
                  <input id="gc-rname" value={rName} onChange={(e) => setRName(e.target.value)} className={field} />
                </div>
                <div>
                  <label htmlFor="gc-remail" className={label}>Recipient&apos;s email</label>
                  <input id="gc-remail" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="gc-msg" className={label}>Personal message (optional)</label>
                <textarea id="gc-msg" rows={3} maxLength={500} value={msg} onChange={(e) => setMsg(e.target.value)} className={field} />
              </div>
              <p className="text-xs text-stone-dim">The gift card code is emailed to the recipient, not to you.</p>
            </div>
          ) : null}
        </Step>

        <Step n={3} title="Pay with cryptocurrency">
          <CryptoPayStep
            idPrefix="gc"
            totalLabel={totalOk ? usd(total) : null}
            optionId={optionId}
            onOption={setOptionId}
            txHash={txHash}
            onTxHash={setTxHash}
          />
        </Step>

        <div className="space-y-4 border-t hairline pt-8">
          <label className="flex gap-3 text-sm text-stone leading-relaxed">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#a8863b]" />
            <span>
              By completing this purchase, I acknowledge and agree to the{" "}
              <Link href="/gift-card-terms" target="_blank" className="text-ivory underline underline-offset-4">gift card terms &amp; conditions</Link>.
            </span>
          </label>
          <TurnstileWidget onToken={setToken} resetKey={reset} />
          {error ? <p role="alert" className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-ivory px-8 py-4 text-sm font-semibold uppercase tracking-wide text-ink hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {status === "sending" ? "Sending…" : "Purchase gift card"}
          </button>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-28" aria-label="Order summary">
        <GiftCardPreview design={design} amount={amountOk ? usd(amount).replace(".00", "") : "US$—"} />
        <dl className="space-y-3 rounded-card border hairline p-5 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Item</dt><dd className="text-ivory">{amountOk ? usd(amount) : "—"} Gift Card</dd></div>
          <div className="flex justify-between"><dt className="text-stone">Quantity</dt><dd className="text-ivory">{qtyOk ? qty : "—"}</dd></div>
          <div className="flex justify-between border-t hairline pt-3 font-display text-lg"><dt className="text-ivory">Total</dt><dd className="text-gold">{totalOk ? usd(total) : "—"}</dd></div>
        </dl>
      </aside>
    </form>
  );
}
