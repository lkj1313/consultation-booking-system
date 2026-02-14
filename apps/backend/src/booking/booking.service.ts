import { EntityManager, EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectEntityManager, InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, BookingStatus } from '../domain/entities/booking.entity';
import {
  CounselorScheduleSlot,
  CounselorScheduleSlotStatus,
} from '../domain/entities/counselor-schedule-slot.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FindAvailableSlotsDto } from './dto/find-available-slots.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectEntityManager('default')
    private readonly em: EntityManager,
    @InjectRepository(Booking)
    private readonly bookingRepository: EntityRepository<Booking>,
    @InjectRepository(CounselorScheduleSlot)
    private readonly slotRepository: EntityRepository<CounselorScheduleSlot>,
  ) {}

  async findAvailableSlots(query: FindAvailableSlotsDto) {
    if (query.from >= query.to) {
      throw new BadRequestException('조회 기간이 올바르지 않습니다.');
    }

    const slots = await this.slotRepository.find(
      {
        ...(query.counselorId ? { counselor: query.counselorId } : {}),
        status: CounselorScheduleSlotStatus.OPEN,
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

    return slots.filter((slot) => slot.bookedCount < slot.capacity);
  }

  async create(dto: CreateBookingDto) {
    const result = await this.em.transactional(async (trxEm) => {
      const slot = await trxEm.findOne(
        CounselorScheduleSlot,
        { id: dto.slotId },
        {
          lockMode: LockMode.PESSIMISTIC_WRITE,
        },
      );

      if (!slot) {
        throw new NotFoundException('스케줄을 찾을 수 없습니다.');
      }

      if (slot.status !== CounselorScheduleSlotStatus.OPEN) {
        throw new BadRequestException('예약할 수 없는 스케줄입니다.');
      }

      if (slot.bookedCount >= slot.capacity) {
        throw new ConflictException('해당 시간대 예약이 마감되었습니다.');
      }

      const duplicated = await trxEm.findOne(Booking, {
        slot: slot.id,
        applicantEmail: dto.applicantEmail,
      });
      if (duplicated) {
        throw new ConflictException('동일한 시간대에 이미 예약되어 있습니다.');
      }

      const booking = trxEm.create(Booking, {
        slot,
        applicantName: dto.applicantName,
        applicantEmail: dto.applicantEmail,
        applicantPhone: dto.applicantPhone ?? null,
        status: BookingStatus.RESERVED,
      });

      slot.bookedCount += 1;

      trxEm.persist(booking);
      await trxEm.flush();

      return booking;
    });

    return this.bookingRepository.findOneOrFail(
      { id: result.id },
      { populate: ['slot', 'slot.counselor'] },
    );
  }
}
