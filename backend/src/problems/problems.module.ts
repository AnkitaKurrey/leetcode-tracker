import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { Problem } from '../entities/problem.entity';
import { RevisionHistory } from '../entities/revision-history.entity';
import { RevisionsModule } from '../revisions/revisions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Problem, RevisionHistory]),
    RevisionsModule,
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
