import type { LoginRequest } from '@consult/shared-types';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginRequestDto implements LoginRequest {
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(72, { message: '비밀번호는 최대 72자까지 입력할 수 있습니다.' })
  password: string;
}
