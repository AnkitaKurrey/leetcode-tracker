import { ProblemStatus, RevisionsService } from './revisions.service';
import { Difficulty, Problem } from '../entities/problem.entity';

const TODAY = '2026-09-29';

function problem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: 1,
    title: 'Two Sum',
    leetcode_url: 'https://leetcode.com/problems/two-sum/',
    difficulty: Difficulty.EASY,
    topics: null,
    companies: null,
    notes: null,
    is_solved: true,
    solved_date: '2026-09-20',
    revision_interval_days: 7,
    next_revision_date: null,
    last_revised_date: null,
    revision_count: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe('RevisionsService', () => {
  const service = new RevisionsService({} as never);

  describe('calculateStatus', () => {
    it('is null for unsolved problems', () => {
      expect(
        service.calculateStatus(problem({ is_solved: false }), TODAY),
      ).toBeNull();
    });

    it('is SOLVED when no revision is scheduled', () => {
      expect(service.calculateStatus(problem(), TODAY)).toBe(
        ProblemStatus.SOLVED,
      );
    });

    it('is DUE when the next revision is today', () => {
      expect(
        service.calculateStatus(problem({ next_revision_date: TODAY }), TODAY),
      ).toBe(ProblemStatus.DUE);
    });

    it('is OVERDUE when the next revision date has passed', () => {
      expect(
        service.calculateStatus(
          problem({ next_revision_date: '2026-09-28' }),
          TODAY,
        ),
      ).toBe(ProblemStatus.OVERDUE);
    });

    it('is OVERDUE even if it was revised before (old revision)', () => {
      expect(
        service.calculateStatus(
          problem({
            next_revision_date: '2026-09-27',
            last_revised_date: '2026-09-20',
          }),
          TODAY,
        ),
      ).toBe(ProblemStatus.OVERDUE);
    });

    it('is SOLVED when scheduled in the future and never revised', () => {
      expect(
        service.calculateStatus(
          problem({ next_revision_date: '2026-10-06' }),
          TODAY,
        ),
      ).toBe(ProblemStatus.SOLVED);
    });

    it('is REVISED when revised and the next revision is in the future', () => {
      expect(
        service.calculateStatus(
          problem({
            next_revision_date: '2026-10-06',
            last_revised_date: TODAY,
            revision_count: 1,
          }),
          TODAY,
        ),
      ).toBe(ProblemStatus.REVISED);
    });
  });

  describe('computeNextRevisionDate', () => {
    it('counts from the solved date when never revised', () => {
      expect(
        service.computeNextRevisionDate(
          { solved_date: '2026-09-27', last_revised_date: null },
          7,
          TODAY,
        ),
      ).toBe('2026-10-04');
    });

    it('counts from the last revision when present', () => {
      expect(
        service.computeNextRevisionDate(
          { solved_date: '2026-09-01', last_revised_date: TODAY },
          3,
          TODAY,
        ),
      ).toBe('2026-10-02');
    });

    it('never schedules in the past: falls back to today as the base', () => {
      expect(
        service.computeNextRevisionDate(
          { solved_date: '2026-06-01', last_revised_date: null },
          7,
          TODAY,
        ),
      ).toBe('2026-10-06');
    });

    it('allows a date that lands exactly on today (becomes DUE)', () => {
      expect(
        service.computeNextRevisionDate(
          { solved_date: '2026-09-22', last_revised_date: null },
          7,
          TODAY,
        ),
      ).toBe(TODAY);
    });

    it('counts from today when neither date is known', () => {
      expect(
        service.computeNextRevisionDate(
          { solved_date: null, last_revised_date: null },
          14,
          TODAY,
        ),
      ).toBe('2026-10-13');
    });
  });

  describe('nextIntervalDays (ladder 7 -> 21 -> 49 -> 91)', () => {
    it('starts at 7 days when nothing was scheduled', () => {
      expect(service.nextIntervalDays(null)).toBe(7);
    });

    it('climbs one rung per revision and stays on the last rung', () => {
      expect(service.nextIntervalDays(7)).toBe(21);
      expect(service.nextIntervalDays(21)).toBe(49);
      expect(service.nextIntervalDays(49)).toBe(91);
      expect(service.nextIntervalDays(91)).toBe(91);
    });

    it('skips a rung when easy and restarts when hard', () => {
      expect(service.nextIntervalDays(7, 'easy')).toBe(49);
      expect(service.nextIntervalDays(null, 'easy')).toBe(21);
      expect(service.nextIntervalDays(49, 'hard')).toBe(7);
    });

    it('treats a manual interval between rungs as the rung above it', () => {
      expect(service.nextIntervalDays(14)).toBe(49);
    });
  });

  describe('scheduleAfterRevision', () => {
    it('counts from the revision day and lands on a weekend', () => {
      const p = problem({
        last_revised_date: '2026-10-03',
        solved_date: '2026-09-20',
      }); // Sat
      expect(service.scheduleAfterRevision(p, 7, '2026-10-03')).toBe(
        '2026-10-10',
      ); // Sat
      expect(service.scheduleAfterRevision(p, 21, '2026-10-03')).toBe(
        '2026-10-24',
      ); // Sat
    });

    it('snaps a weekday revision forward to Saturday', () => {
      const p = problem({
        last_revised_date: '2026-10-06',
        solved_date: '2026-09-20',
      }); // Tue
      expect(service.scheduleAfterRevision(p, 7, '2026-10-06')).toBe(
        '2026-10-17',
      ); // Tue+7 = Tue -> Sat
    });
  });

  describe('initialSchedule', () => {
    it('puts a freshly solved problem on the first rung, on a weekend', () => {
      const p = problem({ solved_date: '2026-10-06', last_revised_date: null }); // Tue
      expect(service.initialSchedule(p, '2026-10-06')).toEqual({
        intervalDays: 7,
        nextRevisionDate: '2026-10-17', // Tue + 7 = Tue -> Sat
      });
    });

    it('never schedules in the past for an old solve date', () => {
      const p = problem({ solved_date: '2026-01-01', last_revised_date: null });
      expect(service.initialSchedule(p, '2026-10-06').nextRevisionDate).toBe(
        '2026-10-17',
      );
    });
  });
});
