import { UserRole } from '../../domain/entities/user.entity';

export interface AuthUser {
  userId: number;
  email: string;
  role: UserRole;
}
