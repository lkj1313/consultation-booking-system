import {
  Check,
  Collection,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  OptionalProps,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Booking } from '@/domain/entities/booking.entity';
import { User } from '@/domain/entities/user.entity';

export enum CounselorScheduleSlotStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity({ tableName: 'counselor_schedule_slots' })
@Unique({ properties: ['counselor', 'startAt', 'endAt'] })
@Index({ properties: ['startAt'] })
@Index({ properties: ['startAt', 'status'] })
@Check<CounselorScheduleSlot>({
  expression: (columns) => `${columns.capacity} BETWEEN 1 AND 3`,
})
@Check<CounselorScheduleSlot>({
  expression: (columns) =>
    `${columns.bookedCount} BETWEEN 0 AND ${columns.capacity}`,
})
@Check<CounselorScheduleSlot>({
  expression: (columns) => `${columns.startAt} < ${columns.endAt}`,
})
export class CounselorScheduleSlot {
  [OptionalProps]?:
    | 'status'
    | 'capacity'
    | 'bookedCount'
    | 'bookings'
    | 'createdAt'
    | 'updatedAt';

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  counselor!: User;

  @Property({ type: 'timestamptz' })
  startAt!: Date;

  @Property({ type: 'timestamptz' })
  endAt!: Date;

  @Enum(() => CounselorScheduleSlotStatus)
  status: CounselorScheduleSlotStatus = CounselorScheduleSlotStatus.OPEN;

  @Property({ type: 'smallint', default: 3 })
  capacity = 3;

  @Property({ type: 'smallint', default: 0 })
  bookedCount = 0;

  @OneToMany(() => Booking, (booking: Booking) => booking.slot)
  bookings = new Collection<Booking>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
