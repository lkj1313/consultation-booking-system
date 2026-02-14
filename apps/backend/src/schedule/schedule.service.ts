import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CounselorScheduleSlot,
  CounselorScheduleSlotStatus,
} from '../domain/entities/counselor-schedule-slot.entity';
import { User, UserRole } from '../domain/entities/user.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { FindSchedulesDto } from './dto/find-schedules.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(CounselorScheduleSlot)
    private readonly slotRepository: EntityRepository<CounselorScheduleSlot>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async create(dto: CreateScheduleDto) {
    this.validateTimeSlot(dto.startAt, dto.endAt);

    const counselor = await this.userRepository.findOne({ id: dto.counselorId });
    if (!counselor) {
      throw new NotFoundException('상담사를 찾을 수 없습니다.');
    }
    if (counselor.role !== UserRole.COUNSELOR) {
      throw new BadRequestException('상담사 계정만 스케줄을 가질 수 있습니다.');
    }

    const duplicated = await this.slotRepository.findOne({
      counselor,
      startAt: dto.startAt,
      endAt: dto.endAt,
    });
    if (duplicated) {
      throw new BadRequestException('동일한 스케줄이 이미 존재합니다.');
    }

    const slot = this.slotRepository.create({
      counselor,
      startAt: dto.startAt,
      endAt: dto.endAt,
      capacity: dto.capacity ?? 3,
      status: dto.status ?? CounselorScheduleSlotStatus.OPEN,
    });

    const em = this.slotRepository.getEntityManager();
    em.persist(slot);
    await em.flush();

    return slot;
  }

  async findAll(query: FindSchedulesDto) {
    if (query.from >= query.to) {
      throw new BadRequestException('조회 기간이 올바르지 않습니다.');
    }

    return this.slotRepository.find(
      {
        ...(query.counselorId ? { counselor: query.counselorId } : {}),
        startAt: {
          $gte: query.from,
          $lt: query.to,
        },
      },
      {
        populate: ['counselor'],
        orderBy: { startAt: 'asc' },
      },
    );
  }

  async update(id: number, dto: UpdateScheduleDto) {
    const slot = await this.slotRepository.findOne({ id }, { populate: ['counselor'] });
    if (!slot) {
      throw new NotFoundException('스케줄을 찾을 수 없습니다.');
    }

    const nextStartAt = dto.startAt ?? slot.startAt;
    const nextEndAt = dto.endAt ?? slot.endAt;
    this.validateTimeSlot(nextStartAt, nextEndAt);

    if (dto.capacity !== undefined && dto.capacity < slot.bookedCount) {
      throw new BadRequestException('현재 예약 수보다 작은 인원으로 수정할 수 없습니다.');
    }

    if (dto.counselorId !== undefined && dto.counselorId !== slot.counselor.id) {
      const counselor = await this.userRepository.findOne({ id: dto.counselorId });
      if (!counselor) {
        throw new NotFoundException('상담사를 찾을 수 없습니다.');
      }
      if (counselor.role !== UserRole.COUNSELOR) {
        throw new BadRequestException('상담사 계정만 스케줄을 가질 수 있습니다.');
      }
      slot.counselor = counselor;
    }

    slot.startAt = nextStartAt;
    slot.endAt = nextEndAt;

    if (dto.capacity !== undefined) {
      slot.capacity = dto.capacity;
    }

    if (dto.status !== undefined) {
      slot.status = dto.status;
    }

    await this.slotRepository.getEntityManager().flush();

    return slot;
  }

  async remove(id: number) {
    const slot = await this.slotRepository.findOne({ id });
    if (!slot) {
      throw new NotFoundException('스케줄을 찾을 수 없습니다.');
    }

    if (slot.bookedCount > 0) {
      throw new BadRequestException('예약이 있는 스케줄은 삭제할 수 없습니다.');
    }

    const em = this.slotRepository.getEntityManager();
    em.remove(slot);
    await em.flush();

    return { success: true };
  }

  private validateTimeSlot(startAt: Date, endAt: Date) {
    if (startAt >= endAt) {
      throw new BadRequestException('시작 시간은 종료 시간보다 빨라야 합니다.');
    }

    const durationMs = endAt.getTime() - startAt.getTime();
    const thirtyMinutesMs = 30 * 60 * 1000;
    if (durationMs !== thirtyMinutesMs) {
      throw new BadRequestException('스케줄은 30분 단위로만 생성할 수 있습니다.');
    }

    const startMinutes = startAt.getUTCMinutes();
    const endMinutes = endAt.getUTCMinutes();
    const validMinute = (value: number) => value === 0 || value === 30;
    if (!validMinute(startMinutes) || !validMinute(endMinutes)) {
      throw new BadRequestException('시각은 00분 또는 30분만 허용됩니다.');
    }

    if (
      startAt.getUTCSeconds() !== 0 ||
      endAt.getUTCSeconds() !== 0 ||
      startAt.getUTCMilliseconds() !== 0 ||
      endAt.getUTCMilliseconds() !== 0
    ) {
      throw new BadRequestException('초/밀리초 단위는 허용되지 않습니다.');
    }
  }
}
