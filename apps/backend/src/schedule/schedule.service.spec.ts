import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  const slotRepository = {
    findOne: jest.fn(),
  };
  const userRepository = {
    findOne: jest.fn(),
  };

  let service: ScheduleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ScheduleService(slotRepository as never, userRepository as never);
  });

  it('본인 상담사 슬롯이 아니면 수정을 거부한다', async () => {
    slotRepository.findOne.mockResolvedValue({
      id: 10,
      counselor: { id: 2 },
      startAt: new Date('2026-02-15T09:00:00Z'),
      endAt: new Date('2026-02-15T09:30:00Z'),
      bookedCount: 0,
    });

    await expect(service.update(1, 10, {} as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('30분 단위가 아닌 스케줄 생성 요청을 거부한다', async () => {
    await expect(
      service.create(1, {
        startAt: new Date('2026-02-15T09:00:00Z'),
        endAt: new Date('2026-02-15T09:45:00Z'),
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
