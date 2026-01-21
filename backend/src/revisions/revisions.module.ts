import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisionsService } from './revisions.service';
import { RevisionsController } from './revisions.controller';
import { Problem } from '../entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Problem])],
  controllers: [RevisionsController],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
