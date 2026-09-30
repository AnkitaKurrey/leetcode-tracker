import { IsInt, Min, Max } from 'class-validator';

export class SetRevisionDto {
  @IsInt()
  @Min(1)
  @Max(365)
  interval_days: number;
}
