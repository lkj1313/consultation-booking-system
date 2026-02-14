import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FindAvailableSlotsDto {
  @Type(() => Date)
  @IsDate()
  from: Date;

  @Type(() => Date)
  @IsDate()
  to: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  counselorId?: number;
}
