import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConsultationNoteService } from './consultation-note.service';
import { BookingStatus } from '@/domain/entities/booking.entity';

describe('ConsultationNoteService', () => {
  const consultationNoteRepository = {};
  const bookingRepository = {
    findOne: jest.fn(),
  };
  const userRepository = {
    findOne: jest.fn(),
  };

  let service: ConsultationNoteService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConsultationNoteService(
      consultationNoteRepository as never,
      bookingRepository as never,
      userRepository as never,
    );
  });

  it('완료되지 않은 예약은 상담 이력 저장을 거부한다', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1 });
    bookingRepository.findOne.mockResolvedValue({
      id: 100,
      status: BookingStatus.RESERVED,
      slot: { counselor: { id: 1 } },
      consultationNote: null,
    });

    await expect(
      service.upsert(
        1,
        {
          bookingId: 100,
          note: '테스트 노트',
        } as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('담당 상담사가 아니면 상담 이력 수정을 거부한다', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1 });
    bookingRepository.findOne.mockResolvedValue({
      id: 100,
      status: BookingStatus.COMPLETED,
      slot: { counselor: { id: 2 } },
      consultationNote: null,
    });

    await expect(
      service.upsert(
        1,
        {
          bookingId: 100,
          note: '테스트 노트',
        } as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
