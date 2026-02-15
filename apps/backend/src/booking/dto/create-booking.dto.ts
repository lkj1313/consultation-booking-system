import type { CreateBookingRequest } from '@consult/shared-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBookingDto implements CreateBookingRequest {
  @Type(() => Number)
  @IsInt({ message: '스케줄 ID는 정수여야 합니다.' })
  @Min(1, { message: '스케줄 ID는 1 이상이어야 합니다.' })
  slotId: number;

  @IsString({ message: '예약 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '예약 토큰은 필수입니다.' })
  token: string;

  @IsOptional()
  @IsString({ message: '연락처는 문자열이어야 합니다.' })
  @MaxLength(30, { message: '연락처는 최대 30자까지 입력할 수 있습니다.' })
  applicantPhone?: string;
}

