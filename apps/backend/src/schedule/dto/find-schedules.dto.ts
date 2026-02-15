import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Min } from 'class-validator';

export class FindSchedulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '상담사 ID는 정수여야 합니다.' })
  @Min(1, { message: '상담사 ID는 1 이상이어야 합니다.' })
  counselorId?: number;

  @Type(() => Date)
  @IsDate({ message: '조회 시작 시각은 올바른 날짜 형식이어야 합니다.' })
  from: Date;

  @Type(() => Date)
  @IsDate({ message: '조회 종료 시각은 올바른 날짜 형식이어야 합니다.' })
  to: Date;
}
