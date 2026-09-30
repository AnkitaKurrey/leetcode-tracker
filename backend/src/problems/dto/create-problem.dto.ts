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
  Max,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Difficulty } from '../../entities/problem.entity';

export const LEETCODE_URL_PATTERN =
  /^https?:\/\/(www\.)?leetcode\.(com|cn)\/problems\/[a-z0-9-]+\/?.*$/i;

/**
 * Every field is optional. A problem must have a title or a LeetCode URL
 * (checked in the service); when only the URL is given the title is derived
 * from its slug.
 */
export class CreateProblemDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string | null;

  @IsOptional()
  @ValidateIf((o: CreateProblemDto) => !!o.leetcode_url)
  @IsUrl()
  @MaxLength(500)
  @Matches(LEETCODE_URL_PATTERN, {
    message:
      'leetcode_url must be a LeetCode problem URL (e.g. https://leetcode.com/problems/two-sum/)',
  })
  leetcode_url?: string | null;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty | null;

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

  /** YYYY-MM-DD (or ISO). Ignored unless is_solved is true. */
  @IsOptional()
  @IsDateString()
  solved_date?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  revision_interval_days?: number | null;

  /**
   * YYYY-MM-DD (or ISO). Send null to have it auto-calculated from
   * revision_interval_days.
   */
  @IsOptional()
  @IsDateString()
  next_revision_date?: string | null;
}
