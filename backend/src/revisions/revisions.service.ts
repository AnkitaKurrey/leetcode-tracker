import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Difficulty, Problem } from '../entities/problem.entity';
import { addDays, today } from '../common/date.util';

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
