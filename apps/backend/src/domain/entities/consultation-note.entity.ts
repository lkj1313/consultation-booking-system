import {
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity({ tableName: 'consultation_notes' })
@Index({ properties: ['counselor', 'createdAt'] })
export class ConsultationNote {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey()
  id!: number;

  @OneToOne(() => Booking, { unique: true })
  booking!: Booking;

  @ManyToOne(() => User)
  counselor!: User;

  @Property({ type: 'text' })
  note!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
