import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ConsultationNote } from './consultation-note.entity';
import { CounselorScheduleSlot } from './counselor-schedule-slot.entity';
import { User } from './user.entity';

export enum BookingStatus {
  RESERVED = 'reserved',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity({ tableName: 'bookings' })
@Unique({ properties: ['slot', 'applicantEmail'] })
@Index({ properties: ['slot', 'status'] })
@Index({ properties: ['applicantEmail'] })
export class Booking {
  [OptionalProps]?:
    | 'status'
    | 'consultationNote'
    | 'createdByCounselor'
    | 'createdAt'
    | 'updatedAt';

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => CounselorScheduleSlot)
  slot!: CounselorScheduleSlot;

  @Property({ length: 100 })
  applicantName!: string;

  @Property({ length: 255 })
  applicantEmail!: string;

  @Property({ length: 30, nullable: true })
  applicantPhone?: string | null;

  @Enum(() => BookingStatus)
  status: BookingStatus = BookingStatus.RESERVED;

  @ManyToOne(() => User, { nullable: true })
  createdByCounselor?: User | null;

  @OneToOne(() => ConsultationNote, (note: ConsultationNote) => note.booking, {
    nullable: true,
    owner: false,
  })
  consultationNote?: ConsultationNote | null;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
