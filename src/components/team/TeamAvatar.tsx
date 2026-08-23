const PALETTES = [
  "from-[#3a2f1f] to-[#161310]",
  "from-[#1f2f2c] to-[#101614]",
  "from-[#2f2418] to-[#161210]",
  "from-[#242a35] to-[#12151c]",
  "from-[#33261c] to-[#171310]",
  "from-[#26302c] to-[#131917]",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function paletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
}

export function TeamAvatar({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-card border hairline bg-gradient-to-br ${paletteFor(
        name,
      )} ${className}`}
    >
      <span className="font-display text-4xl text-gold/80 md:text-5xl">{initials(name)}</span>
      <div className="pointer-events-none absolute inset-0 border border-white/5" />
    </div>
  );
}
