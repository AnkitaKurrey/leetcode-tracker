import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [ScheduleModule.forRoot(), RevisionsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
