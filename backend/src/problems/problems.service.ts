import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryFailedError, Repository } from 'typeorm';
import { Problem } from '../entities/problem.entity';
import {
  RevisionHistory,
  RevisionStatus,
} from '../entities/revision-history.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { QueryProblemsDto } from './dto/query-problems.dto';
import {
  ProblemWithStatus,
  RevisionsService,
  ReviseResult,
} from '../revisions/revisions.service';
import { toDateOnly, today } from '../common/date.util';

/** "https://leetcode.com/problems/two-sum/" -> "Two Sum" */
export function titleFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = /\/problems\/([a-z0-9-]+)/i.exec(url);
  if (!m) return null;
  return m[1]
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
    @InjectRepository(RevisionHistory)
    private readonly historyRepository: Repository<RevisionHistory>,
    private readonly revisionsService: RevisionsService,
  ) {}

  async create(dto: CreateProblemDto): Promise<ProblemWithStatus> {
    const leetcodeUrl = dto.leetcode_url?.trim() || null;
    const title = dto.title?.trim() || titleFromUrl(leetcodeUrl);
    if (!title) {
      throw new BadRequestException(
        'Provide a title or a LeetCode URL for the problem',
      );
    }

    const problem = this.problemRepository.create({
      title,
      leetcode_url: leetcodeUrl,
      difficulty: dto.difficulty ?? null,
      topics: this.cleanList(dto.topics),
      companies: this.cleanList(dto.companies),
      notes: dto.notes?.trim() || null,
      is_solved: dto.is_solved ?? false,
      solved_date: null,
      revision_interval_days: null,
      next_revision_date: null,
      last_revised_date: null,
      revision_count: 0,
    });

    if (problem.is_solved) {
      problem.solved_date = toDateOnly(dto.solved_date) ?? today();
      problem.revision_interval_days = dto.revision_interval_days ?? null;
      this.reconcileSchedule(problem, toDateOnly(dto.next_revision_date));
    }

    const saved = await this.saveHandlingDuplicates(problem);
    return this.revisionsService.withStatus(saved);
  }

  async findAll(query: QueryProblemsDto = {}): Promise<ProblemWithStatus[]> {
    const where: FindOptionsWhere<Problem> = {};
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.is_solved !== undefined)
      where.is_solved = query.is_solved === 'true';

    const problems = await this.problemRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    const withStatus = problems.map((p) => this.revisionsService.withStatus(p));
    return query.status
      ? withStatus.filter((p) => p.status === query.status)
      : withStatus;
  }

  async findOne(id: number): Promise<ProblemWithStatus> {
    return this.revisionsService.withStatus(await this.getOrFail(id));
  }

  async getHistory(id: number): Promise<RevisionHistory[]> {
    await this.getOrFail(id);
    return this.historyRepository.find({
      where: { problem_id: id },
      order: { revised_date: 'DESC', id: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateProblemDto): Promise<ProblemWithStatus> {
    const problem = await this.getOrFail(id);

    if (dto.leetcode_url !== undefined) {
      problem.leetcode_url = dto.leetcode_url?.trim() || null;
    }
    if (dto.title !== undefined) {
      problem.title =
        dto.title?.trim() || titleFromUrl(problem.leetcode_url) || '';
    }
    if (!problem.title) {
      throw new BadRequestException(
        'Provide a title or a LeetCode URL for the problem',
      );
    }
    if (dto.difficulty !== undefined) problem.difficulty = dto.difficulty;
    if (dto.topics !== undefined) problem.topics = this.cleanList(dto.topics);
    if (dto.companies !== undefined)
      problem.companies = this.cleanList(dto.companies);
    if (dto.notes !== undefined) problem.notes = dto.notes.trim() || null;
    if (dto.is_solved !== undefined) problem.is_solved = dto.is_solved;

    if (!problem.is_solved) {
      // Un-solving a problem clears its revision schedule.
      problem.solved_date = null;
      problem.revision_interval_days = null;
      problem.next_revision_date = null;
      problem.last_revised_date = null;
    } else {
      if (dto.solved_date !== undefined) {
        problem.solved_date = toDateOnly(dto.solved_date);
      }
      problem.solved_date ??= today();

      const intervalChanged =
        dto.revision_interval_days !== undefined &&
        dto.revision_interval_days !== problem.revision_interval_days;
      if (dto.revision_interval_days !== undefined) {
        problem.revision_interval_days = dto.revision_interval_days;
      }

      // `next_revision_date: null` means "recalculate from the interval".
      // A changed interval without an explicit date also recalculates.
      let explicitNext: string | null;
      if (dto.next_revision_date !== undefined) {
        explicitNext = toDateOnly(dto.next_revision_date);
      } else if (intervalChanged) {
        explicitNext = null;
      } else {
        explicitNext = problem.next_revision_date;
      }
      this.reconcileSchedule(problem, explicitNext);
    }

    const saved = await this.saveHandlingDuplicates(problem);
    return this.revisionsService.withStatus(saved);
  }

  async remove(id: number): Promise<void> {
    const result = await this.problemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }
  }

  async markAsSolved(
    id: number,
    solvedDate?: string,
  ): Promise<ProblemWithStatus> {
    const problem = await this.getOrFail(id);

    if (!problem.is_solved) {
      problem.is_solved = true;
      problem.solved_date = toDateOnly(solvedDate) ?? today();
      this.reconcileSchedule(problem, problem.next_revision_date);
    }

    const saved = await this.problemRepository.save(problem);
    return this.revisionsService.withStatus(saved);
  }

  async setRevisionSchedule(
    id: number,
    intervalDays: number,
  ): Promise<ProblemWithStatus> {
    const problem = await this.getOrFail(id);

    if (!problem.is_solved) {
      throw new BadRequestException(
        'Problem must be solved before setting revision schedule',
      );
    }

    problem.revision_interval_days = intervalDays;
    problem.next_revision_date = this.revisionsService.computeNextRevisionDate(
      problem,
      intervalDays,
    );

    const saved = await this.problemRepository.save(problem);
    return this.revisionsService.withStatus(saved);
  }

  /**
   * Record a revision and schedule the next one on the spaced-repetition
   * ladder (7 -> 21 -> 49 -> 91 days), always landing on a weekend.
   * `result` says how it went: 'easy' skips a rung, 'hard' restarts at 7 days.
   */
  async markAsRevised(
    id: number,
    result: ReviseResult = 'ok',
  ): Promise<ProblemWithStatus> {
    const problem = await this.getOrFail(id);

    if (!problem.is_solved) {
      throw new BadRequestException('Problem must be solved before revising');
    }

    const revisedOn = today();
    problem.last_revised_date = revisedOn;
    problem.revision_count = (problem.revision_count || 0) + 1;
    problem.revision_interval_days = this.revisionsService.nextIntervalDays(
      problem.revision_interval_days,
      result,
    );
    problem.next_revision_date = this.revisionsService.scheduleAfterRevision(
      problem,
      problem.revision_interval_days,
    );

    const saved = await this.problemRepository.save(problem);
    await this.historyRepository.save(
      this.historyRepository.create({
        problem_id: saved.id,
        revised_date: revisedOn,
        status: RevisionStatus.REVISED,
        notes: result,
      }),
    );

    return this.revisionsService.withStatus(saved);
  }

  // ---------------------------------------------------------------------------

  private async getOrFail(id: number): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }
    return problem;
  }

  /**
   * Keep next_revision_date consistent with the interval:
   * - explicit date given -> use it
   * - interval set but no date -> compute it
   * - no interval -> no scheduled revision
   */
  private reconcileSchedule(problem: Problem, explicitNext: string | null) {
    if (explicitNext) {
      problem.next_revision_date = explicitNext;
    } else if (problem.revision_interval_days) {
      problem.next_revision_date =
        this.revisionsService.computeNextRevisionDate(
          problem,
          problem.revision_interval_days,
        );
    } else {
      problem.next_revision_date = null;
    }
  }

  private cleanList(values?: string[] | null): string[] | null {
    if (!values) return null;
    const cleaned = Array.from(
      new Set(values.map((v) => v.trim()).filter(Boolean)),
    );
    return cleaned.length ? cleaned : null;
  }

  private async saveHandlingDuplicates(problem: Problem): Promise<Problem> {
    try {
      return await this.problemRepository.save(problem);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as QueryFailedError & { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'A problem with this LeetCode URL already exists',
        );
      }
      throw err;
    }
  }
}
