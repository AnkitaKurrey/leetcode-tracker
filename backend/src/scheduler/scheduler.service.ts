import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RevisionsService } from '../revisions/revisions.service';

/**
 * Problem status is derived on read (see RevisionsService.calculateStatus), so
 * nothing needs to be persisted here. The daily job produces a log summary of
 * what became due/overdue so reminders can be hooked in (email, push, etc.).
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly revisionsService: RevisionsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyStatusUpdate(): Promise<void> {
    this.logger.log('Running daily revision reminder job...');
    try {
      const [due, overdue] = await Promise.all([
        this.revisionsService.getDueProblems(),
        this.revisionsService.getOverdueProblems(),
      ]);

      this.logger.log(
        `Revision summary: ${due.length} due today, ${overdue.length} overdue`,
      );
      for (const p of due) {
        this.logger.log(`DUE     #${p.id} ${p.title}`);
      }
      for (const p of overdue) {
        this.logger.warn(
          `OVERDUE #${p.id} ${p.title} (was due ${p.next_revision_date})`,
        );
      }
      this.logger.log('Daily revision reminder job completed');
    } catch (err) {
      this.logger.error(
        'Daily revision reminder job failed',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
