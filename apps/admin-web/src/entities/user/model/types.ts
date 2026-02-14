export type UserRole = 'admin';

export interface RegisterUserPayload {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUserResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
