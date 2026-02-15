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
  @Type(() => Date)
  @IsDate({ message: '시작 시간은 올바른 날짜 형식이어야 합니다.' })
  @IsNotEmpty({ message: '시작 시간은 필수입니다.' })
  startAt: Date;

  @Type(() => Date)
  @IsDate({ message: '종료 시간은 올바른 날짜 형식이어야 합니다.' })
  @IsNotEmpty({ message: '종료 시간은 필수입니다.' })
  endAt: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '정원은 정수여야 합니다.' })
  @Min(1, { message: '정원은 1명 이상이어야 합니다.' })
  @Max(3, { message: '정원은 3명 이하여야 합니다.' })
  capacity?: number;

  @IsOptional()
  @IsEnum(CounselorScheduleSlotStatus, { message: '스케줄 상태 값이 올바르지 않습니다.' })
  status?: CounselorScheduleSlotStatus;
}
