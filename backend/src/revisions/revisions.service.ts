import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Difficulty, Problem } from '../entities/problem.entity';
import { addDays, snapToWeekend, today } from '../common/date.util';

export type ReviseResult = 'easy' | 'ok' | 'hard';

export enum ProblemStatus {
  SOLVED = 'SOLVED',
  DUE = 'DUE',
  OVERDUE = 'OVERDUE',
  REVISED = 'REVISED',
}

export type ProblemWithStatus = Problem & { status: ProblemStatus | null };

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
  ) {}

  /**
   * Status rules (see README "Status Calculation"):
   *  - null     : not solved yet
   *  - SOLVED   : solved, no revision scheduled OR scheduled in the future and never revised
   *  - DUE      : next revision date is today
   *  - OVERDUE  : next revision date has passed
   *  - REVISED  : revised, and the next revision date is in the future
   */
  calculateStatus(problem: Problem, todayStr = today()): ProblemStatus | null {
    if (!problem.is_solved) return null;
    if (!problem.next_revision_date) return ProblemStatus.SOLVED;

    const next = problem.next_revision_date;
    if (next === todayStr) return ProblemStatus.DUE;
    if (next < todayStr) return ProblemStatus.OVERDUE;

    return problem.last_revised_date
      ? ProblemStatus.REVISED
      : ProblemStatus.SOLVED;
  }

  withStatus(problem: Problem): ProblemWithStatus {
    return { ...problem, status: this.calculateStatus(problem) };
  }

  /**
   * Compute the next revision date.
   * Base date = last revision, else solved date, else today. The result is never
   * in the past: if the computed date has already passed, count from today so a
   * freshly-set schedule does not start out OVERDUE.
   */
  computeNextRevisionDate(
    problem: Pick<Problem, 'last_revised_date' | 'solved_date'>,
    intervalDays: number,
    todayStr = today(),
  ): string {
    const base = problem.last_revised_date ?? problem.solved_date ?? todayStr;
    const next = addDays(base, intervalDays);
    return next < todayStr ? addDays(todayStr, intervalDays) : next;
  }

  /**
   * Spaced-repetition ladder, in days. Each successful revision moves a problem
   * one rung up; "easy" skips a rung, "hard" drops back to the first rung.
   * The last rung repeats (quarterly maintenance).
   */
  static readonly LADDER = [7, 21, 49, 91];

  nextIntervalDays(
    current: number | null,
    result: ReviseResult = 'ok',
  ): number {
    const ladder = RevisionsService.LADDER;
    if (result === 'hard') return ladder[0];
    const idx = current ? ladder.findIndex((d) => d >= current) : -1;
    const step = result === 'easy' ? 2 : 1;
    const next = (idx < 0 ? -1 : idx) + step;
    return ladder[Math.min(next, ladder.length - 1)];
  }

  /**
   * Schedule for a problem that has just been solved: the first rung of the
   * ladder, counted from the solve date, on a weekend.
   */
  initialSchedule(
    problem: Pick<Problem, 'last_revised_date' | 'solved_date'>,
    todayStr = today(),
  ): { intervalDays: number; nextRevisionDate: string } {
    const intervalDays = RevisionsService.LADDER[0];
    return {
      intervalDays,
      nextRevisionDate: this.scheduleAfterRevision(
        problem,
        intervalDays,
        todayStr,
      ),
    };
  }

  /** Next revision date after a revision today: interval from today, on a weekend. */
  scheduleAfterRevision(
    problem: Pick<Problem, 'last_revised_date' | 'solved_date'>,
    intervalDays: number,
    todayStr = today(),
  ): string {
    return snapToWeekend(
      this.computeNextRevisionDate(problem, intervalDays, todayStr),
    );
  }

  async getDueProblems(): Promise<ProblemWithStatus[]> {
    const problems = await this.problemRepository.find({
      where: { is_solved: true, next_revision_date: today() },
      order: { next_revision_date: 'ASC', title: 'ASC' },
    });
    return problems.map((p) => this.withStatus(p));
  }

  async getOverdueProblems(): Promise<ProblemWithStatus[]> {
    const problems = await this.problemRepository.find({
      where: { is_solved: true, next_revision_date: LessThan(today()) },
      order: { next_revision_date: 'ASC', title: 'ASC' },
    });
    return problems.map((p) => this.withStatus(p));
  }

  async getDashboardSummary() {
    const [allProblems, dueProblems, overdueProblems] = await Promise.all([
      this.problemRepository.find(),
      this.getDueProblems(),
      this.getOverdueProblems(),
    ]);
    const solvedProblems = allProblems.filter((p) => p.is_solved);

    const stats = {
      total: allProblems.length,
      solved: solvedProblems.length,
      due: dueProblems.length,
      overdue: overdueProblems.length,
      byDifficulty: {
        EASY: solvedProblems.filter((p) => p.difficulty === Difficulty.EASY)
          .length,
        MEDIUM: solvedProblems.filter((p) => p.difficulty === Difficulty.MEDIUM)
          .length,
        HARD: solvedProblems.filter((p) => p.difficulty === Difficulty.HARD)
          .length,
      },
    };

    return { stats, dueProblems, overdueProblems };
  }
}
