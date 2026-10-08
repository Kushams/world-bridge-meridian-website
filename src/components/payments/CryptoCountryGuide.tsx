"use client";

import { useState } from "react";
import { cryptoCountryGroups, cryptoCountryGuides, cryptoGlossary } from "@/data/cryptoBuyingGuide";

export function CryptoCountryGuide() {
  const [country, setCountry] = useState("");
  const selectedGuide = cryptoCountryGroups
    .flatMap((g) => g.countries)
    .find((c) => c.name === country)?.guide;

  return (
    <div className="rounded-card border hairline bg-ink/40 p-6 md:p-8">
      <p className="font-display text-xl text-ivory">New to crypto? Here&apos;s how to buy it.</p>
      <p className="mt-3 text-sm text-stone leading-relaxed">
        Choose your country and we&apos;ll show a short set of steps to get started — a legitimate,
        licensed exchange, how to fund it, and how to send crypto to the address your consultant
        confirms.
      </p>
      <p className="mt-4 rounded-2xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-ivory-dim leading-relaxed">
        <span className="font-semibold text-ivory">First time?</span> No experience needed. USDC, a
        digital dollar, is the simplest choice for most first-timers, and your consultant can help
        you at any step.
      </p>
      <label htmlFor="crypto-country" className="mt-6 block text-xs uppercase tracking-[0.18em] text-stone-dim">
        Your country
      </label>
      <select
        id="crypto-country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="mt-2 w-full rounded-full border border-line bg-ink px-5 py-3 text-sm text-ivory-dim outline-none focus:border-gold"
      >
        <option value="">Select your country</option>
        {cryptoCountryGroups.map((g) => (
          <optgroup key={g.continent} label={g.continent}>
            {g.countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <div aria-live="polite">
      {cryptoCountryGuides.map((guide) => (
        <div key={guide.id} hidden={guide.id !== selectedGuide} className="mt-6 border-t hairline pt-6">
          {guide.platforms.length > 0 && (
            <p className="text-xs uppercase tracking-[0.18em] text-stone-dim">
              Common platforms: <span className="text-gold">{guide.platforms.join(", ")}</span>
            </p>
          )}
          <ol className="mt-4 space-y-3 text-sm text-ivory-dim leading-relaxed">
            {guide.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span aria-hidden className="w-5 shrink-0 font-display text-gold">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {guide.note && <p className="mt-5 text-xs text-stone leading-relaxed">{guide.note}</p>}
        </div>
      ))}
      </div>

      <details className="group mt-6 border-t hairline pt-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ivory">
          New to the words? Crypto terms explained
          <span aria-hidden className="text-gold transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <dl className="mt-4 space-y-3 text-sm leading-relaxed">
          {cryptoGlossary.map((g) => (
            <div key={g.term}>
              <dt className="text-ivory">{g.term}</dt>
              <dd className="text-stone">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
