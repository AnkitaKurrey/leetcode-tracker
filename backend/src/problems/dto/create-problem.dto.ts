import {
  IsString,
  IsUrl,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { Difficulty } from '../../entities/problem.entity';

export class CreateProblemDto {
  @IsString()
  title: string;

  @IsUrl()
  leetcode_url: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companies?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_solved?: boolean;

  @ValidateIf((o) => o.is_solved === true)
  @IsOptional()
  @IsDateString()
  solved_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  revision_interval_days?: number;

  @IsOptional()
  @IsDateString()
  next_revision_date?: string;
}
