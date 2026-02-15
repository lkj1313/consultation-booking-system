import {
  Check,
  Entity,
  Index,
  ManyToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { User } from './user.entity';

@Entity({ tableName: 'booking_link_tokens' })
@Unique({ properties: ['tokenHash'] })
@Index({ properties: ['targetName', 'targetEmail', 'expiresAt'] })
@Index({ properties: ['counselor', 'createdAt'] })
@Check<BookingLinkToken>({
  expression: (columns) => `${columns.expiresAt} > ${columns.createdAt}`,
})
export class BookingLinkToken {
  [OptionalProps]?: 'usedAt' | 'isRevoked' | 'createdAt';

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  counselor!: User;

  @Property({ length: 255 })
  tokenHash!: string;

  @Property({ length: 255 })
  targetEmail!: string;

  @Property({ length: 100 })
  targetName!: string;

  @Property({ type: 'timestamptz' })
  expiresAt!: Date;

  @Property({ type: 'timestamptz', nullable: true })
  usedAt?: Date | null;

  @Property({ default: false })
  isRevoked = false;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
