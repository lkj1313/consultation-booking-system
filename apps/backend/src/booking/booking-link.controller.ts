import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../domain/entities/user.entity';
import { BookingService } from './booking.service';
import { CreateBookingLinkDto } from './dto/create-booking-link.dto';

type RequestWithUser = Request & { user?: AuthUser };

@Controller('booking-links')
export class BookingLinkController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Req() request: RequestWithUser, @Body() dto: CreateBookingLinkDto) {
    return this.bookingService.createBookingLink(request.user!.userId, dto);
  }
}
