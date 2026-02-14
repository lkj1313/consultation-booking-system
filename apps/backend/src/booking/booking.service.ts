import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from '@/booking/dto/create-booking.dto';
import { FindAvailableSlotsDto } from '@/booking/dto/find-available-slots.dto';
import { FindBookingsDto } from '@/booking/dto/find-bookings.dto';
import { Booking, BookingStatus } from '@/domain/entities/booking.entity';
import {
  CounselorScheduleSlot,
  CounselorScheduleSlotStatus,
} from '@/domain/entities/counselor-schedule-slot.entity';

@Injectable()
export class BookingService {
  constructor(
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

  async findBookings(query: FindBookingsDto) {
    if (query.from && query.to && query.from >= query.to) {
      throw new BadRequestException('조회 기간이 올바르지 않습니다.');
    }

    const startAtFilter =
      query.from || query.to
        ? {
            ...(query.from ? { $gte: query.from } : {}),
            ...(query.to ? { $lt: query.to } : {}),
          }
        : undefined;

    return this.bookingRepository.find(
      {
        ...(query.status ? { status: query.status } : {}),
        ...(query.counselorId || startAtFilter
          ? {
              slot: {
                ...(query.counselorId ? { counselor: query.counselorId } : {}),
                ...(startAtFilter ? { startAt: startAtFilter } : {}),
              },
            }
          : {}),
      },
      {
        populate: ['slot', 'slot.counselor'],
        orderBy: { createdAt: 'desc' },
      },
    );
  }

  async create(dto: CreateBookingDto) {
    const em = this.bookingRepository.getEntityManager();
    const result = await em.transactional(async (trxEm) => {
      const slot = await trxEm.findOne(
        CounselorScheduleSlot,
        { id: dto.slotId },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
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

  async cancel(bookingId: number) {
    const em = this.bookingRepository.getEntityManager();
    const result = await em.transactional(async (trxEm) => {
      const booking = await trxEm.findOne(
        Booking,
        { id: bookingId },
        { populate: ['slot'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!booking) {
        throw new NotFoundException('예약을 찾을 수 없습니다.');
      }

      const slot = await trxEm.findOne(
        CounselorScheduleSlot,
        { id: booking.slot.id },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!slot) {
        throw new NotFoundException('스케줄을 찾을 수 없습니다.');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('이미 취소된 예약입니다.');
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('완료된 예약은 취소할 수 없습니다.');
      }

      booking.status = BookingStatus.CANCELLED;
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await trxEm.flush();

      return booking.id;
    });

    return this.bookingRepository.findOneOrFail(
      { id: result },
      { populate: ['slot', 'slot.counselor'] },
    );
  }

  async complete(bookingId: number) {
    const em = this.bookingRepository.getEntityManager();
    const result = await em.transactional(async (trxEm) => {
      const booking = await trxEm.findOne(
        Booking,
        { id: bookingId },
        { populate: ['slot'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!booking) {
        throw new NotFoundException('예약을 찾을 수 없습니다.');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('취소된 예약은 완료 처리할 수 없습니다.');
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new BadRequestException('이미 완료된 예약입니다.');
      }

      booking.status = BookingStatus.COMPLETED;
      await trxEm.flush();

      return booking.id;
    });

    return this.bookingRepository.findOneOrFail(
      { id: result },
      { populate: ['slot', 'slot.counselor'] },
    );
  }
}
