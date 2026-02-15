import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, BookingStatus } from '@/domain/entities/booking.entity';
import { ConsultationNote } from '@/domain/entities/consultation-note.entity';
import { User } from '@/domain/entities/user.entity';
import { UpsertConsultationNoteDto } from './dto/upsert-consultation-note.dto';

@Injectable()
export class ConsultationNoteService {
  constructor(
    @InjectRepository(ConsultationNote)
    private readonly consultationNoteRepository: EntityRepository<ConsultationNote>,
    @InjectRepository(Booking)
    private readonly bookingRepository: EntityRepository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async upsert(counselorId: number, dto: UpsertConsultationNoteDto) {
    const counselor = await this.userRepository.findOne({ id: counselorId });
    if (!counselor) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const booking = await this.bookingRepository.findOne(
      { id: dto.bookingId },
      { populate: ['slot', 'slot.counselor', 'consultationNote'] },
    );
    if (!booking) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }
    if (booking.slot.counselor.id !== counselor.id) {
      throw new ForbiddenException(
        '해당 슬롯 담당자만 상담 이력을 수정할 수 있습니다.',
      );
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('상담 완료 상태에서만 상담 이력을 기록할 수 있습니다.');
    }

    const noteText = dto.note.trim();
    if (!noteText) {
      throw new BadRequestException('상담 이력은 비어 있을 수 없습니다.');
    }

    const note = booking.consultationNote
      ? booking.consultationNote
      : this.consultationNoteRepository.create({
          booking,
          counselor,
          note: noteText,
        });

    note.note = noteText;
    note.counselor = counselor;

    const em = this.consultationNoteRepository.getEntityManager();
    em.persist(note);
    await em.flush();

    return {
      id: note.id,
      bookingId: booking.id,
      counselorId: counselor.id,
      note: note.note,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async findByBookingId(counselorId: number, bookingId: number) {
    const booking = await this.bookingRepository.findOne(
      { id: bookingId },
      { populate: ['slot', 'slot.counselor', 'consultationNote'] },
    );
    if (!booking) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }
    if (booking.slot.counselor.id !== counselorId) {
      throw new ForbiddenException(
        '해당 슬롯 담당자만 상담 이력을 조회할 수 있습니다.',
      );
    }

    const note = booking.consultationNote;
    if (!note) {
      return null;
    }

    return {
      id: note.id,
      bookingId: booking.id,
      counselorId: note.counselor.id,
      note: note.note,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
