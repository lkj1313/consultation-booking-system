import type { UserRole } from '@/entities/user';
import type { AuthTokenResponse, LoginRequest } from '@consult/shared-types';
import { http } from '@/shared/api';

export type LoginPayload = LoginRequest;

export interface LoginResponse extends AuthTokenResponse {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await http.post<LoginResponse>('/auth/login', payload);
  return response.data;
};

