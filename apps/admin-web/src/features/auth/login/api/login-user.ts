import type { UserRole } from '@/entities/user';
import { http } from '@/shared/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
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
