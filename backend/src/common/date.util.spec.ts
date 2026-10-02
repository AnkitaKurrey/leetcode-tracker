import {
  addDays,
  formatDateOnly,
  toDateOnly,
  maxDate,
  snapToWeekend,
} from './date.util';

describe('date.util', () => {
  it('formats a Date using local components', () => {
    expect(formatDateOnly(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('passes through YYYY-MM-DD strings untouched', () => {
    expect(toDateOnly('2026-09-29')).toBe('2026-09-29');
  });

  it('normalises ISO strings and Date objects', () => {
    const d = new Date(2026, 8, 29, 15, 30);
    expect(toDateOnly(d)).toBe('2026-09-29');
    expect(toDateOnly(d.toISOString())).toBe('2026-09-29');
  });

  it('returns null for empty or invalid input', () => {
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly(undefined)).toBeNull();
    expect(toDateOnly('')).toBeNull();
    expect(toDateOnly('not a date')).toBeNull();
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
    expect(addDays('2026-12-30', 7)).toBe('2027-01-06');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('picks the later date', () => {
    expect(maxDate('2026-01-01', '2026-01-02')).toBe('2026-01-02');
    expect(maxDate('2026-01-02', '2026-01-01')).toBe('2026-01-02');
  });

  describe('snapToWeekend', () => {
    it('keeps Saturdays and Sundays', () => {
      expect(snapToWeekend('2026-10-03')).toBe('2026-10-03'); // Sat
      expect(snapToWeekend('2026-10-04')).toBe('2026-10-04'); // Sun
    });

    it('moves weekdays forward to the coming Saturday', () => {
      expect(snapToWeekend('2026-10-05')).toBe('2026-10-10'); // Mon -> Sat
      expect(snapToWeekend('2026-10-09')).toBe('2026-10-10'); // Fri -> Sat
    });
  });
});
