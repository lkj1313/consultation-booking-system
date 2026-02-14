import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FindSchedulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  counselorId?: number;

  @Type(() => Date)
  @IsDate()
  from: Date;

  @Type(() => Date)
  @IsDate()
  to: Date;
}
