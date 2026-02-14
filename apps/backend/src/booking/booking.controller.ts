import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../domain/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindAvailableSlotsDto } from './dto/find-available-slots.dto';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('available-slots')
  findAvailableSlots(@Query() query: FindAvailableSlotsDto) {
    return this.bookingService.findAvailableSlots(query);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingService.create(dto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.cancel(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.complete(id);
  }
}
