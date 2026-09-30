import { IsBooleanString, IsEnum, IsOptional } from 'class-validator';
import { Difficulty } from '../../entities/problem.entity';
import { ProblemStatus } from '../../revisions/revisions.service';

export class QueryProblemsDto {
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(ProblemStatus)
  status?: ProblemStatus;

  @IsOptional()
  @IsBooleanString()
  is_solved?: string;
}
