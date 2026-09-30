/**
 * Date-only helpers. All "date" columns (solved_date, next_revision_date,
 * last_revised_date, revised_date) are handled as `YYYY-MM-DD` strings in the
 * server's local timezone so that comparisons are timezone-safe and
 * lexicographic string comparison works ('2026-01-02' < '2026-01-10').
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Format a Date as YYYY-MM-DD using local time components. */
export function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's date as YYYY-MM-DD (local time). */
export function today(): string {
  return formatDateOnly(new Date());
}

/**
 * Normalise any incoming date value (YYYY-MM-DD, full ISO string, or Date)
 * to a YYYY-MM-DD string. Returns null for empty input.
 */
export function toDateOnly(
  value: string | Date | null | undefined,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string') {
    const m = DATE_ONLY.exec(value);
    if (m) return value;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return formatDateOnly(parsed);
  }
  if (isNaN(value.getTime())) return null;
  return formatDateOnly(value);
}

/** Add `days` to a YYYY-MM-DD string and return a YYYY-MM-DD string. */
export function addDays(dateOnly: string, days: number): string {
  const m = DATE_ONLY.exec(dateOnly);
  if (!m) throw new Error(`Invalid date-only value: ${dateOnly}`);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setDate(d.getDate() + days);
  return formatDateOnly(d);
}

/** Return the later of two YYYY-MM-DD strings. */
export function maxDate(a: string, b: string): string {
  return a >= b ? a : b;
}
