export type UserRole = 'admin' | 'counselor';

export interface RegisterUserPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface RegisterUserResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
