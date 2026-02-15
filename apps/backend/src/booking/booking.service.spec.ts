import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingService } from './booking.service';
import { BookingStatus } from '@/domain/entities/booking.entity';

describe('BookingService', () => {
  const bookingRepository = {
    find: jest.fn(),
  };
  const slotRepository = {
    find: jest.fn(),
  };
  const bookingLinkTokenRepository = {
    findOne: jest.fn(),
  };
  const userRepository = {};
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let service: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BookingService(
      bookingRepository as never,
      slotRepository as never,
      bookingLinkTokenRepository as never,
      userRepository as never,
      configService,
    );
  });

  it('예약 조회는 query.counselorId와 무관하게 로그인 상담사 ID로 필터링한다', async () => {
    bookingRepository.find.mockResolvedValue([]);

    await service.findBookings(7, {
      counselorId: 999,
      status: BookingStatus.RESERVED,
    } as never);

    expect(bookingRepository.find).toHaveBeenCalledTimes(1);
    expect(bookingRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BookingStatus.RESERVED,
        slot: expect.objectContaining({
          counselor: 7,
        }),
      }),
      expect.any(Object),
    );
  });

  it('조회 기간 from >= to 이면 예외를 던진다', async () => {
    await expect(
      service.findBookings(1, {
        from: new Date('2026-02-15T10:00:00Z'),
        to: new Date('2026-02-15T10:00:00Z'),
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('유효하지 않은 예약 링크 토큰이면 가용 슬롯 조회를 거부한다', async () => {
    bookingLinkTokenRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findAvailableSlots({
        token: 'invalid-token',
        from: new Date('2026-02-15T00:00:00Z'),
        to: new Date('2026-03-01T00:00:00Z'),
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('이미 사용된 예약 링크 토큰이면 가용 슬롯 조회를 거부한다', async () => {
    bookingLinkTokenRepository.findOne.mockResolvedValue({
      isRevoked: false,
      usedAt: new Date('2026-02-15T01:00:00Z'),
      expiresAt: new Date('2026-02-16T00:00:00Z'),
      counselor: { id: 1 },
    });

    await expect(
      service.findAvailableSlots({
        token: 'used-token',
        from: new Date('2026-02-15T00:00:00Z'),
        to: new Date('2026-03-01T00:00:00Z'),
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('만료된 예약 링크 토큰이면 가용 슬롯 조회를 거부한다', async () => {
    bookingLinkTokenRepository.findOne.mockResolvedValue({
      isRevoked: false,
      usedAt: null,
      expiresAt: new Date('2020-01-01T00:00:00Z'),
      counselor: { id: 1 },
    });

    await expect(
      service.findAvailableSlots({
        token: 'expired-token',
        from: new Date('2026-02-15T00:00:00Z'),
        to: new Date('2026-03-01T00:00:00Z'),
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
