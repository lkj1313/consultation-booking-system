import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { Booking } from '../domain/entities/booking.entity';
import { BookingLinkToken } from '../domain/entities/booking-link-token.entity';
import { CounselorScheduleSlot } from '../domain/entities/counselor-schedule-slot.entity';
import { User } from '../domain/entities/user.entity';
import { BookingLinkController } from './booking-link.controller';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Booking,
      CounselorScheduleSlot,
      BookingLinkToken,
      User,
    ]),
    AuthModule,
  ],
  controllers: [BookingController, BookingLinkController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
