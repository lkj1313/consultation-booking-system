import type { RegisterUserPayload, RegisterUserResponse } from '@/entities/user';
import { http } from '@/shared/api';

export const registerUser = async (
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> => {
  const response = await http.post<RegisterUserResponse>('/auth/register', payload);
  return response.data;
};
