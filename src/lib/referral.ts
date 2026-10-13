/**
 * Reads a staff member's personal-link code from a page address.
 * The code is `?from=ravi` (their personal link) or `?ref=ravi` (used on links that already need `from` for a date).
 * The exhibition forms use `from=2026-10-13` for the start date, so a date must never be taken for a code:
 * it would overwrite the real one the visitor arrived with.
 */
export function referralCodeFromSearch(search: string): string | null {
  const q = new URLSearchParams(search);
  for (const key of ["ref", "from"]) {
    const code = q.get(key)?.trim().toLowerCase();
    if (!code || !/^[a-z0-9-]{2,30}$/.test(code)) continue;
    if (/^\d{4}-\d{2}-\d{2}$/.test(code)) continue;
    return code;
  }
  return null;
}
