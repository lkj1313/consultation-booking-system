import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(72, { message: 'password must be at most 72 characters long' })
  @Matches(/^(?=.*[^A-Za-z0-9\s]).+$/, {
    message: 'password must include at least one special character',
  })
  password: string;

  @IsString({ message: 'name must be a string' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(50, { message: 'name must be at most 50 characters long' })
  name: string;
}
