import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Booking } from '../domain/entities/booking.entity';
import { CounselorScheduleSlot } from '../domain/entities/counselor-schedule-slot.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [MikroOrmModule.forFeature([Booking, CounselorScheduleSlot])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
