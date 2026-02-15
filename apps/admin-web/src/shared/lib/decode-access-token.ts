import { jwtDecode } from 'jwt-decode';
import type { UserRole } from '@/entities/user';

interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface DecodedSession {
  userId: number;
  email: string;
  role: UserRole;
}

export const decodeAccessToken = (token: string): DecodedSession | null => {
  try {
    const payload = jwtDecode<AccessTokenPayload>(token);

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};
