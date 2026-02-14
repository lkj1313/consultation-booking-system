import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
