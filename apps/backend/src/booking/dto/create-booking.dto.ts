import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  slotId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  applicantName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  applicantEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  applicantPhone?: string;
}
