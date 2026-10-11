import { cardPaymentProvider } from "@/data/cardPayments";

export type PayMethod = "card" | "crypto";

const methods: { key: PayMethod; title: string; sub: string; icon: string }[] = [
  { key: "card", title: "Card, Apple Pay or Google Pay", sub: "No crypto needed", icon: "M2 7h20v10H2zM2 11h20M6 15h4" },
  { key: "crypto", title: "Cryptocurrency", sub: "USDC, USDT, BTC, ETH and more", icon: "M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

/** Two large tiles to choose how to pay. */
export function PayMethodPicker({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {methods.map((m) => (
        <button
          key={m.key}
          type="button"
          role="radio"
          aria-checked={value === m.key}
          onClick={() => onChange(m.key)}
          className={`flex items-center gap-4 rounded-card border p-4 text-left transition-colors ${
            value === m.key ? "border-gold bg-gold/10 ring-1 ring-gold" : "border-line hover:border-gold"
          }`}
        >
          <span aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${value === m.key ? "bg-gold text-ink" : "border border-line text-ivory"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={m.icon} />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-semibold text-ivory">{m.title}</span>
            <span className="block text-xs text-stone">{m.sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** Which button to press on the ePayVista checkout page, by where the card was issued. */
export function CardCheckoutTips() {
  const rows = [
    ["US card", "Pay by card"],
    ["Card from Europe or elsewhere", "Card & wallets, or Pay with Coinbase"],
    ["Already have crypto", "Already have crypto?"],
  ];
  return (
    <div className="rounded-card border hairline p-5">
      <p className="text-sm font-semibold text-ivory">On the secure checkout page, choose:</p>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(([who, pick]) => (
          <div key={who} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t hairline pt-2 first:border-t-0 first:pt-0">
            <dt className="text-stone">{who}</dt>
            <dd className="font-semibold text-gold">{pick}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-stone-dim leading-relaxed">
        Payment opens on {cardPaymentProvider.host} ({cardPaymentProvider.name}), our payment provider. We never see your card details.
      </p>
    </div>
  );
}
