import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entities/problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { RevisionsService } from '../revisions/revisions.service';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
    private readonly revisionsService: RevisionsService,
  ) {}

  async create(createProblemDto: CreateProblemDto): Promise<Problem> {
    const problemData: Partial<Problem> = {
      title: createProblemDto.title,
      leetcode_url: createProblemDto.leetcode_url,
      difficulty: createProblemDto.difficulty,
      topics: createProblemDto.topics,
      companies: createProblemDto.companies,
      notes: createProblemDto.notes,
      is_solved: createProblemDto.is_solved || false,
    };

    if (createProblemDto.solved_date) {
      problemData.solved_date = new Date(createProblemDto.solved_date);
    }

    const problem = this.problemRepository.create(problemData);
    return await this.problemRepository.save(problem);
  }

  async findAll(filters?: {
    status?: string;
    difficulty?: string;
    is_solved?: boolean;
  }): Promise<(Problem & { status: string | null })[]> {
    const where: any = {};

    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters?.is_solved !== undefined) {
      where.is_solved = filters.is_solved;
    }

    const problems = await this.problemRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    return problems.map((problem) => ({
      ...problem,
      status: this.revisionsService.calculateStatus(problem),
    }));
  }

  async findOne(id: number): Promise<Problem & { status: string | null }> {
    const problem = await this.problemRepository.findOne({ where: { id } });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    return {
      ...problem,
      status: this.revisionsService.calculateStatus(problem),
    };
  }

  async update(id: number, updateProblemDto: UpdateProblemDto): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where: { id } });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    const updateData: any = { ...updateProblemDto };
    if (updateProblemDto.solved_date) {
      updateData.solved_date = new Date(updateProblemDto.solved_date);
    }
    if (updateProblemDto.next_revision_date) {
      updateData.next_revision_date = new Date(updateProblemDto.next_revision_date);
    }

    Object.assign(problem, updateData);
    return this.problemRepository.save(problem);
  }

  async remove(id: number): Promise<void> {
    const result = await this.problemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }
  }

  async markAsSolved(id: number, solvedDate?: Date): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where: { id } });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    problem.is_solved = true;
    problem.solved_date = solvedDate || new Date();

    return this.problemRepository.save(problem);
  }

  async setRevisionSchedule(
    id: number,
    intervalDays: number,
  ): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where: { id } });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    if (!problem.is_solved) {
      throw new BadRequestException(
        'Problem must be solved before setting revision schedule',
      );
    }

    problem.revision_interval_days = intervalDays;
    problem.next_revision_date =
      this.revisionsService.updateNextRevisionDate(problem, intervalDays);

    return this.problemRepository.save(problem);
  }

  async markAsRevised(id: number): Promise<Problem> {
    const problem = await this.problemRepository.findOne({ where: { id } });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    if (!problem.is_solved) {
      throw new BadRequestException('Problem must be solved before revising');
    }

    const today = new Date();
    problem.last_revised_date = today;
    problem.revision_count = (problem.revision_count || 0) + 1;

    if (problem.revision_interval_days) {
      problem.next_revision_date =
        this.revisionsService.updateNextRevisionDate(
          problem,
          problem.revision_interval_days,
        );
    }

    return this.problemRepository.save(problem);
  }
}
