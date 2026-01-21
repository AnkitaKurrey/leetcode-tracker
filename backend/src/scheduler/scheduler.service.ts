import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from '../entities/problem.entity';
import { RevisionsService } from '../revisions/revisions.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Problem)
    private readonly problemRepository: Repository<Problem>,
    private readonly revisionsService: RevisionsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyStatusUpdate() {
    this.logger.log('Running daily status update job...');

    const problems = await this.problemRepository
      .createQueryBuilder('problem')
      .where('problem.is_solved = :is_solved', { is_solved: true })
      .andWhere('problem.revision_interval_days IS NOT NULL')
      .getMany();

    this.logger.log(`Found ${problems.length} problems with revision schedules`);

    for (const problem of problems) {
      if (
        problem.next_revision_date &&
        new Date(problem.next_revision_date) <= new Date()
      ) {
        this.logger.log(
          `Problem ${problem.id} (${problem.title}) is due or overdue for revision`,
        );
      }
    }

    this.logger.log('Daily status update job completed');
  }
}
