import { IsIn, IsOptional } from 'class-validator';
import type { ReviseResult } from '../../revisions/revisions.service';

/** How the revision went; decides the next rung of the ladder. Default 'ok'. */
export class ReviseDto {
  @IsOptional()
  @IsIn(['easy', 'ok', 'hard'])
  result?: ReviseResult;
}
