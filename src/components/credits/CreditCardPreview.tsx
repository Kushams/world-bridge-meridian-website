/** The on-screen Travel Credits card. Colours are fixed (not theme tokens) so it always looks like a card. */
export function CreditCardPreview({ amount, holder }: { amount: string; holder?: string }) {
  return (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-2xl p-6 text-white shadow-xl"
      style={{ background: "linear-gradient(135deg,#0f1c33 0%,#1d3a5c 55%,#8a5a22 100%)", aspectRatio: "1.586 / 1" }}
      role="img"
      aria-label={`World Bridge Meridian Travel Credits card, ${amount}`}
    >
      <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 right-8 h-40 w-40 rounded-full bg-[#d9ab63]/25" />
      <div className="relative flex items-start justify-between">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c27a]">Travel Credits</p>
        <span aria-hidden className="flex">
          <span className="h-7 w-7 rounded-full bg-[#d9ab63]/80" />
          <span className="-ml-3 h-7 w-7 rounded-full bg-white/40" />
        </span>
      </div>
      <span
        aria-hidden
        className="relative mt-4 block h-8 w-11 rounded-md"
        style={{ background: "linear-gradient(135deg,#f3dca4 0%,#c9a25a 50%,#f0d590 100%)" }}
      />
      <p className="relative mt-3 font-display text-4xl tracking-tight">{amount}</p>
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.18em] text-white/60">Card holder</p>
          <p className="truncate font-sans text-xs uppercase tracking-[0.14em]">{holder || "Your name"}</p>
        </div>
        <p className="shrink-0 font-display text-base">World Bridge Meridian</p>
      </div>
    </div>
  );
}
