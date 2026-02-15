import {
  Body,
  Controller,
  Delete,
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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { FindSchedulesDto } from './dto/find-schedules.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

type RequestWithUser = Request & { user?: AuthUser };

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Req() request: RequestWithUser, @Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(request.user!.userId, dto);
  }

  @Get()
  findAll(@Req() request: RequestWithUser, @Query() query: FindSchedulesDto) {
    return this.scheduleService.findAll(request.user!.userId, query);
  }

  @Patch(':id')
  update(
    @Req() request: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(request.user!.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() request: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.remove(request.user!.userId, id);
  }
}
