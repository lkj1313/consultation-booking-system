import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { Booking } from '@/domain/entities/booking.entity';
import { ConsultationNote } from '@/domain/entities/consultation-note.entity';
import { User } from '@/domain/entities/user.entity';
import { ConsultationNoteController } from './consultation-note.controller';
import { ConsultationNoteService } from './consultation-note.service';

@Module({
  imports: [MikroOrmModule.forFeature([ConsultationNote, Booking, User]), AuthModule],
  controllers: [ConsultationNoteController],
  providers: [ConsultationNoteService],
  exports: [ConsultationNoteService],
})
export class ConsultationNoteModule {}
