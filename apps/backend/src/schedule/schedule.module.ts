import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CounselorScheduleSlot } from '../domain/entities/counselor-schedule-slot.entity';
import { User } from '../domain/entities/user.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [MikroOrmModule.forFeature([CounselorScheduleSlot, User]), AuthModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
