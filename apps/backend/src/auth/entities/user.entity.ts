import {
  Entity,
  Enum,
  OptionalProps,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

export enum UserRole {
  ADMIN = 'admin',
  COUNSELOR = 'counselor',
}

@Entity({ tableName: 'users' })
export class User {
  [OptionalProps]?: 'createdAt' | 'updatedAt';

  @PrimaryKey()
  id!: number;

  @Property({ length: 255, unique: true })
  email!: string;

  @Property({ length: 255 })
  passwordHash!: string;

  @Property({ length: 50 })
  name!: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.COUNSELOR;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
