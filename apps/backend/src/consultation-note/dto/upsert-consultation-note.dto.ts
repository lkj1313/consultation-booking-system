import type { UpsertConsultationNoteRequest } from '@consult/shared-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class UpsertConsultationNoteDto implements UpsertConsultationNoteRequest {
  @Type(() => Number)
  @IsInt({ message: '예약 ID는 정수여야 합니다.' })
  @Min(1, { message: '예약 ID는 1 이상이어야 합니다.' })
  bookingId: number;

  @IsString({ message: '상담 이력은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '상담 이력은 필수입니다.' })
  @MaxLength(2000, { message: '상담 이력은 최대 2000자까지 입력할 수 있습니다.' })
  note: string;
}
