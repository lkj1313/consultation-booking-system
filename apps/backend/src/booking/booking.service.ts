import { createHash, randomBytes } from 'node:crypto';
import { EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { CreateBookingLinkDto } from '@/booking/dto/create-booking-link.dto';
import { CreateBookingDto } from '@/booking/dto/create-booking.dto';
import { FindAvailableSlotsDto } from '@/booking/dto/find-available-slots.dto';
import { FindBookingsDto } from '@/booking/dto/find-bookings.dto';
import { Booking, BookingStatus } from '@/domain/entities/booking.entity';
import { BookingLinkToken } from '@/domain/entities/booking-link-token.entity';
import {
  CounselorScheduleSlot,
  CounselorScheduleSlotStatus,
} from '@/domain/entities/counselor-schedule-slot.entity';
import { User } from '@/domain/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: EntityRepository<Booking>,
    @InjectRepository(CounselorScheduleSlot)
    private readonly slotRepository: EntityRepository<CounselorScheduleSlot>,
    @InjectRepository(BookingLinkToken)
    private readonly bookingLinkTokenRepository: EntityRepository<BookingLinkToken>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createBookingLink(counselorId: number, dto: CreateBookingLinkDto) {
    const counselor = await this.userRepository.findOne({ id: counselorId });
    if (!counselor) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const plainToken = this.createPlainToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const bookingLinkToken = this.bookingLinkTokenRepository.create({
      counselor,
      tokenHash: this.hashToken(plainToken),
      targetEmail: dto.targetEmail.trim().toLowerCase(),
      targetName: dto.targetName.trim(),
      expiresAt,
    });

    const em = this.bookingLinkTokenRepository.getEntityManager();
    em.persist(bookingLinkToken);
    await em.flush();

    const reservationUrl = this.buildReservationUrl(plainToken);

    return {
      targetName: bookingLinkToken.targetName,
      targetEmail: bookingLinkToken.targetEmail,
      expiresAt,
      reservationUrl,
      message: await this.sendBookingLinkEmail({
        targetName: bookingLinkToken.targetName,
        targetEmail: bookingLinkToken.targetEmail,
        reservationUrl,
        expiresAt,
      }),
    };
  }

  async findAvailableSlots(query: FindAvailableSlotsDto) {
    if (query.from >= query.to) {
      throw new BadRequestException('조회 기간이 올바르지 않습니다.');
    }

    const bookingLinkToken = await this.resolveActiveBookingLink(query.token);

    const slots = await this.slotRepository.find(
      {
        counselor: bookingLinkToken.counselor.id,
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
    const tokenHash = this.hashToken(dto.token);

    const em = this.bookingRepository.getEntityManager();
    const result = await em.transactional(async (trxEm) => {
      const bookingLinkToken = await trxEm.findOne(
        BookingLinkToken,
        { tokenHash },
        { populate: ['counselor'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      this.ensureBookingLinkUsable(bookingLinkToken);

      const normalizedApplicantEmail = bookingLinkToken.targetEmail
        .trim()
        .toLowerCase();

      const slot = await trxEm.findOne(
        CounselorScheduleSlot,
        { id: dto.slotId },
        { populate: ['counselor'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );

      if (!slot) {
        throw new NotFoundException('스케줄을 찾을 수 없습니다.');
      }

      if (slot.counselor.id !== bookingLinkToken.counselor.id) {
        throw new BadRequestException(
          '해당 링크로 예약할 수 없는 스케줄입니다.',
        );
      }

      if (slot.status !== CounselorScheduleSlotStatus.OPEN) {
        throw new BadRequestException('예약할 수 없는 스케줄 상태입니다.');
      }

      if (slot.bookedCount >= slot.capacity) {
        throw new ConflictException('해당 시간대 예약이 마감되었습니다.');
      }

      const duplicated = await trxEm.findOne(Booking, {
        slot: slot.id,
        applicantEmail: normalizedApplicantEmail,
      });
      if (duplicated) {
        throw new ConflictException('동일한 시간대에 이미 예약이 존재합니다.');
      }

      const booking = trxEm.create(Booking, {
        slot,
        applicantName:
          bookingLinkToken.targetName.trim() ||
          this.deriveApplicantNameFromEmail(normalizedApplicantEmail),
        applicantEmail: normalizedApplicantEmail,
        applicantPhone: dto.applicantPhone?.trim() || null,
        status: BookingStatus.RESERVED,
      });

      slot.bookedCount += 1;
      bookingLinkToken.usedAt = new Date();
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

  private createPlainToken() {
    return randomBytes(32).toString('hex');
  }

  private hashToken(plainToken: string) {
    return createHash('sha256').update(plainToken).digest('hex');
  }

  private deriveApplicantNameFromEmail(email: string) {
    const localPart = email.split('@')[0]?.trim() ?? '';
    const normalized = localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (normalized.length >= 2) {
      return normalized.slice(0, 100);
    }

    return '예약자';
  }

  private buildReservationUrl(plainToken: string) {
    const reserveBaseUrl = this.configService.get<string>(
      'APPLICANT_RESERVE_BASE_URL',
      'http://localhost:5174/reserve',
    );
    return `${reserveBaseUrl}?token=${encodeURIComponent(plainToken)}`;
  }

  private async sendBookingLinkEmail(params: {
    targetName: string;
    targetEmail: string;
    reservationUrl: string;
    expiresAt: Date;
  }) {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpUser || !smtpPass) {
      return 'SMTP 설정이 없어 메일 발송을 건너뛰었습니다.';
    }

    const smtpHost = this.configService.get<string>(
      'SMTP_HOST',
      'smtp.gmail.com',
    );
    const smtpPort = this.configService.get<number>('SMTP_PORT', 465);
    const smtpSecure =
      this.configService.get<string>(
        'SMTP_SECURE',
        String(smtpPort === 465),
      ) === 'true';
    const mailFrom = this.configService.get<string>('MAIL_FROM', smtpUser);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.sendMail({
        from: mailFrom,
        to: params.targetEmail,
        subject: '[상담 예약] 예약 링크 안내',
        text: [
          `안녕하세요, ${params.targetName}님.`,
          '',
          '아래 링크에서 상담 예약을 진행해 주세요.',
          params.reservationUrl,
          '',
          `링크 만료 시각: ${params.expiresAt.toISOString()}`,
        ].join('\n'),
        html: `
          <p>안녕하세요, ${params.targetName}님.</p>
          <p>아래 링크에서 상담 예약을 진행해 주세요.</p>
          <p><a href="${params.reservationUrl}">${params.reservationUrl}</a></p>
          <p>링크 만료 시각: ${params.expiresAt.toISOString()}</p>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        '예약 링크 메일 발송에 실패했습니다.',
      );
    }

    return '예약 링크를 이메일로 전송했습니다.';
  }

  private async resolveActiveBookingLink(plainToken: string) {
    const bookingLinkToken = await this.bookingLinkTokenRepository.findOne(
      { tokenHash: this.hashToken(plainToken) },
      { populate: ['counselor'] },
    );
    this.ensureBookingLinkUsable(bookingLinkToken);
    return bookingLinkToken;
  }

  private ensureBookingLinkUsable(
    bookingLinkToken: BookingLinkToken | null,
  ): asserts bookingLinkToken is BookingLinkToken {
    if (!bookingLinkToken) {
      throw new NotFoundException('유효하지 않은 예약 링크입니다.');
    }

    if (bookingLinkToken.isRevoked) {
      throw new BadRequestException('만료된 예약 링크입니다.');
    }

    if (bookingLinkToken.usedAt) {
      throw new BadRequestException('이미 사용된 예약 링크입니다.');
    }

    if (bookingLinkToken.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('만료된 예약 링크입니다.');
    }
  }
}
