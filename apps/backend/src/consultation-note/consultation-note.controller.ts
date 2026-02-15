import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthUser } from '@/auth/types/auth-user.interface';
import { UserRole } from '@/domain/entities/user.entity';
import { UpsertConsultationNoteDto } from './dto/upsert-consultation-note.dto';
import { ConsultationNoteService } from './consultation-note.service';

type RequestWithUser = Request & { user?: AuthUser };

@Controller('consultation-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ConsultationNoteController {
  constructor(
    private readonly consultationNoteService: ConsultationNoteService,
  ) {}

  @Post()
  upsert(
    @Req() request: RequestWithUser,
    @Body() dto: UpsertConsultationNoteDto,
  ) {
    return this.consultationNoteService.upsert(request.user!.userId, dto);
  }

  @Get(':bookingId')
  findByBookingId(
    @Req() request: RequestWithUser,
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ) {
    return this.consultationNoteService.findByBookingId(
      request.user!.userId,
      bookingId,
    );
  }
}
