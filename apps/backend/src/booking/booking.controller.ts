import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { UserRole } from '../domain/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindAvailableSlotsDto } from './dto/find-available-slots.dto';
import { FindBookingsDto } from './dto/find-bookings.dto';
import { BookingService } from './booking.service';

type RequestWithUser = Request & { user?: AuthUser };

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('available-slots')
  findAvailableSlots(@Query() query: FindAvailableSlotsDto) {
    return this.bookingService.findAvailableSlots(query);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findBookings(
    @Req() request: RequestWithUser,
    @Query() query: FindBookingsDto,
  ) {
    return this.bookingService.findBookings(request.user!.userId, query);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  cancel(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.cancel(request.user!.userId, id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  complete(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.complete(request.user!.userId, id);
  }
}
