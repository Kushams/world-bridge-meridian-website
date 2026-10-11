/** A short "never paid in crypto?" pointer shown inside a pay step, linking to the step-by-step guide below it. */
export function NewToCryptoHint() {
  return (
    <a
      href="#new-to-crypto"
      className="flex items-center gap-4 rounded-card border border-gold/40 bg-gold/10 p-4 transition-colors hover:border-gold"
    >
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ivory">New to crypto? Start here</span>
        <span className="block text-xs text-stone">7 simple steps to buy and send it from your country.</span>
      </span>
      <span aria-hidden className="ml-auto text-gold">→</span>
    </a>
  );
}
