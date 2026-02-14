import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BookingStatus } from '../../domain/entities/booking.entity';

export class FindBookingsDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  counselorId?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
