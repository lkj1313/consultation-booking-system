import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { CounselorScheduleSlotStatus } from '../../domain/entities/counselor-schedule-slot.entity';

export class CreateScheduleDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  counselorId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startAt: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endAt: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  capacity?: number;

  @IsOptional()
  @IsEnum(CounselorScheduleSlotStatus)
  status?: CounselorScheduleSlotStatus;
}
