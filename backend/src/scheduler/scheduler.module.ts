import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { Problem } from '../entities/problem.entity';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Problem]),
    RevisionsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
