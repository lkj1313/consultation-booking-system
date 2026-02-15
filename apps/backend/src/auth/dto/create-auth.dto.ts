import type { RegisterRequest } from '@consult/shared-types';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAuthDto implements RegisterRequest {
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(72, { message: '비밀번호는 최대 72자까지 입력할 수 있습니다.' })
  @Matches(/^(?=.*[^A-Za-z0-9\s]).+$/, {
    message: '비밀번호에는 특수문자가 최소 1개 포함되어야 합니다.',
  })
  password: string;

  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력할 수 있습니다.' })
  name: string;
}
