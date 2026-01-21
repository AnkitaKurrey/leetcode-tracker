import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entities/problem.entity';

export enum ProblemStatus {
  SOLVED = 'SOLVED',
  DUE = 'DUE',
  OVERDUE = 'OVERDUE',
  REVISED = 'REVISED',
}

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
  ) {}

  calculateStatus(problem: Problem): ProblemStatus | null {
    if (!problem.is_solved) return null;
    if (!problem.next_revision_date) return ProblemStatus.SOLVED;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revisionDate = new Date(problem.next_revision_date);
    revisionDate.setHours(0, 0, 0, 0);

    if (problem.last_revised_date) {
      const lastRevised = new Date(problem.last_revised_date);
      lastRevised.setHours(0, 0, 0, 0);
      if (lastRevised >= revisionDate) {
        return ProblemStatus.REVISED;
      }
    }

    if (revisionDate.getTime() === today.getTime()) {
      return ProblemStatus.DUE;
    }

    if (revisionDate < today) {
      return ProblemStatus.OVERDUE;
    }

    return ProblemStatus.SOLVED;
  }

  updateNextRevisionDate(problem: Problem, intervalDays: number): Date {
    const baseDate = problem.last_revised_date
      ? new Date(problem.last_revised_date)
      : problem.solved_date
        ? new Date(problem.solved_date)
        : new Date();

    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    return nextDate;
  }

  async getDueProblems(): Promise<Problem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const problems = await this.problemRepository.find({
      where: {
        is_solved: true,
      },
    });

    return problems.filter((problem) => {
      if (!problem.next_revision_date) return false;
      const revisionDate = new Date(problem.next_revision_date);
      revisionDate.setHours(0, 0, 0, 0);
      return revisionDate.getTime() === today.getTime();
    });
  }

  async getOverdueProblems(): Promise<Problem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const problems = await this.problemRepository.find({
      where: {
        is_solved: true,
      },
    });

    return problems.filter((problem) => {
      if (!problem.next_revision_date) return false;
      const revisionDate = new Date(problem.next_revision_date);
      revisionDate.setHours(0, 0, 0, 0);
      return revisionDate < today;
    });
  }

  async getDashboardSummary() {
    const allProblems = await this.problemRepository.find();
    const solvedProblems = allProblems.filter((p) => p.is_solved);

    const dueProblems = await this.getDueProblems();
    const overdueProblems = await this.getOverdueProblems();

    const stats = {
      total: allProblems.length,
      solved: solvedProblems.length,
      due: dueProblems.length,
      overdue: overdueProblems.length,
      byDifficulty: {
        EASY: solvedProblems.filter((p) => p.difficulty === 'EASY').length,
        MEDIUM: solvedProblems.filter((p) => p.difficulty === 'MEDIUM').length,
        HARD: solvedProblems.filter((p) => p.difficulty === 'HARD').length,
      },
    };

    return {
      stats,
      dueProblems,
      overdueProblems,
    };
  }
}
