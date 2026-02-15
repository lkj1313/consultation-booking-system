import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BookingLinkToken } from './booking-link-token.entity';
import { Booking } from './booking.entity';
import { ConsultationNote } from './consultation-note.entity';
import { CounselorScheduleSlot } from './counselor-schedule-slot.entity';

export enum UserRole {
  ADMIN = 'admin',
  COUNSELOR = 'counselor',
}

@Entity({ tableName: 'users' })
export class User {
  [OptionalProps]?:
    | 'createdAt'
    | 'updatedAt'
    | 'scheduleSlots'
    | 'consultationNotes'
    | 'bookingLinkTokens';

  @PrimaryKey()
  id!: number;

  @Property({ length: 255, unique: true })
  email!: string;

  @Property({ length: 255 })
  passwordHash!: string;

  @Property({ length: 50 })
  name!: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.ADMIN;

  @OneToMany(() => CounselorScheduleSlot, (slot: CounselorScheduleSlot) => slot.counselor)
  scheduleSlots = new Collection<CounselorScheduleSlot>(this);

  @OneToMany(() => ConsultationNote, (note: ConsultationNote) => note.counselor)
  consultationNotes = new Collection<ConsultationNote>(this);

  @OneToMany(() => BookingLinkToken, (token: BookingLinkToken) => token.counselor)
  bookingLinkTokens = new Collection<BookingLinkToken>(this);

  @OneToMany(() => Booking, (booking: Booking) => booking.createdByCounselor, {
    nullable: true,
  })
  createdBookings = new Collection<Booking>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
