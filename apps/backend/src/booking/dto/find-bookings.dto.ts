import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BookingStatus } from '../../domain/entities/booking.entity';

export class FindBookingsDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '조회 시작 시각은 올바른 날짜 형식이어야 합니다.' })
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: '조회 종료 시각은 올바른 날짜 형식이어야 합니다.' })
  to?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '상담사 ID는 정수여야 합니다.' })
  @Min(1, { message: '상담사 ID는 1 이상이어야 합니다.' })
  counselorId?: number;

  @IsOptional()
  @IsEnum(BookingStatus, { message: '예약 상태 값이 올바르지 않습니다.' })
  status?: BookingStatus;
}
