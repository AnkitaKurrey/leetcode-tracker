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
});
