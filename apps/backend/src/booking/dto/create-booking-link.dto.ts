import type { CreateBookingLinkRequest } from '@consult/shared-types';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBookingLinkDto implements CreateBookingLinkRequest {
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름은 필수입니다.' })
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '이름은 최대 100자까지 입력할 수 있습니다.' })
  targetName: string;

  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  @MaxLength(255, { message: '이메일은 최대 255자까지 입력할 수 있습니다.' })
  targetEmail: string;
}

