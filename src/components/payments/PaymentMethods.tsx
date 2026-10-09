"use client";

import { ReactNode, useSyncExternalStore } from "react";

type Method = "bank" | "crypto";

const CRYPTO_HASHES = ["cryptocurrency", "buy-crypto", "send-safely", "submit-payment"];

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** "all" until hydrated (and with no JS) so nothing is ever hidden from crawlers or no-JS visitors. */
function hashMethod(): Method | "none" {
  const id = window.location.hash.slice(1);
  if (CRYPTO_HASHES.includes(id)) return "crypto";
  if (id === "bank-transfer") return "bank";
  return "none";
}

/**
 * One choice, one path: the client picks bank transfer or crypto and only
 * that method's instructions show. Both stay in the page (just hidden) so
 * links like /payments#buy-crypto open the right one.
 */
export function PaymentMethods({ bank, crypto }: { bank: ReactNode; crypto: ReactNode }) {
  const fromHash = useSyncExternalStore(subscribe, hashMethod, () => "all" as const);
  const active: Method | "all" = fromHash === "none" ? "bank" : fromHash;

  // The URL hash is the single source of truth, so tab clicks and links like
  // /payments#buy-crypto always agree. replaceState avoids a scroll jump.
  const pick = (m: Method) => {
    window.history.replaceState(null, "", m === "bank" ? "#bank-transfer" : "#cryptocurrency");
    window.dispatchEvent(new Event("hashchange"));
  };

  const tab = (m: Method, title: string, sub: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={active === m}
      onClick={() => pick(m)}
      className={`rounded-card border p-5 text-left transition-colors md:p-6 ${
        active === m ? "border-gold bg-gold/5" : "hairline hover:border-gold"
      }`}
    >
      <span className="block font-display text-xl text-ivory md:text-2xl">{title}</span>
      <span className="mt-1 block text-sm text-stone leading-relaxed">{sub}</span>
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="Payment method" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tab("bank", "Bank transfer", "Your consultant sends the details.")}
        {tab("crypto", "Cryptocurrency", "Buy, send, and tell us. We guide you.")}
      </div>
      <div hidden={active === "crypto"} id="bank-transfer" className="scroll-mt-24 pt-10">
        {bank}
      </div>
      <div hidden={active === "bank"} id="cryptocurrency" className="scroll-mt-24 pt-10">
        {crypto}
      </div>
    </div>
  );
}
