// Keeps passport numbers out of email. No imports, so tests/privacy.test.mjs can run it directly.

/** "AB1234567" -> "••••••567": enough for staff to recognise it, never the full number in an inbox. */
export function mask(value: unknown): string {
  const t = String(value ?? "").trim();
  return t.length <= 3 ? "•••" : `${"•".repeat(Math.min(t.length - 3, 8))}${t.slice(-3)}`;
}

/** Hides a companion's passport number inside their one-line summary ("Passport number: X | ..."). */
export function hidePassport(line: unknown): string {
  return String(line ?? "").replace(/(Passport number: )([^|]*?)(\s*(?:\||$))/, (_m, a: string, num: string, tail: string) => `${a}${mask(num)}${tail}`);
}
