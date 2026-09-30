const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a date value into a Date. A bare `YYYY-MM-DD` string is treated as a
 * local calendar date (NOT UTC midnight) so it never shifts by a day in
 * timezones west of UTC.
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
  const m = DATE_ONLY.exec(date);
  const parsed = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/** Format a Date as `YYYY-MM-DD` (local time), suitable for <input type="date">. */
export function toDateInputValue(date: string | Date | null | undefined): string {
  const d = parseDate(date);
  if (!d) return '';
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

/** Today's date as `YYYY-MM-DD` (local time). */
export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

/** Formats a date to dd/mm/yyyy for display. */
export function formatDate(date: string | Date | null | undefined): string {
  const d = parseDate(date);
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

/** Whole-day difference between a date and today (negative = past). */
export function daysFromToday(date: string | Date | null | undefined): number | null {
  const d = parseDate(date);
  if (!d) return null;
  const today = parseDate(todayInputValue())!;
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

/** "Today", "Tomorrow", "in 5 days", "Yesterday", "3 days ago". */
export function formatRelativeDay(date: string | Date | null | undefined): string {
  const n = daysFromToday(date);
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 0) return `in ${n} days`;
  return `${-n} days ago`;
}

/** "29 Sep 2026" */
export function formatDateLong(date: string | Date | null | undefined): string {
  const d = parseDate(date);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
