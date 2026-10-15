/** Joins place names without repeating one the text already contains: "5 Hanover Square, London" + "London" stays "5 Hanover Square, London". */
export function uniquePlace(parts: (string | null | undefined)[]): string {
  const out: string[] = [];
  for (const raw of parts) {
    const part = raw?.trim();
    if (!part) continue;
    if (out.join(", ").toLowerCase().includes(part.toLowerCase())) continue;
    out.push(part);
  }
  return out.join(", ");
}

/** "Pace Gallery, London · United Kingdom": the venue, then where it is, without saying the city twice. */
export function venueLine(name: string, city: string, country: string): string {
  const where = uniquePlace([name, city, country]).slice(name.length).replace(/^,\s*/, "");
  return where ? `${name} · ${where}` : name;
}
