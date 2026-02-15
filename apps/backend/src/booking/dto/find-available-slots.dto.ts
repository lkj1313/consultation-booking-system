import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FindAvailableSlotsDto {
  @IsString({ message: '예약 토큰은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '예약 토큰은 필수입니다.' })
  @MinLength(10, { message: '예약 토큰 길이가 올바르지 않습니다.' })
  token: string;

  @Type(() => Date)
  @IsDate({ message: '조회 시작 시각은 올바른 날짜 형식이어야 합니다.' })
  from: Date;

  @Type(() => Date)
  @IsDate({ message: '조회 종료 시각은 올바른 날짜 형식이어야 합니다.' })
  to: Date;
}
