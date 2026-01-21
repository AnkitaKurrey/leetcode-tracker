import { IsInt, Min } from 'class-validator';

export class SetRevisionDto {
  @IsInt()
  @Min(1)
  interval_days: number;
}
