import { create } from 'zustand';
import type { UserRole } from './types';

interface SessionState {
  isAuthenticated: boolean;
  userId: number | null;
  email: string | null;
  role: UserRole | null;
  setSession: (payload: { userId: number; email: string; role: UserRole }) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isAuthenticated: false,
  userId: null,
  email: null,
  role: null,
  setSession: ({ userId, email, role }) =>
    set({
      isAuthenticated: true,
      userId,
      email,
      role,
    }),
  clearSession: () =>
    set({
      isAuthenticated: false,
      userId: null,
      email: null,
      role: null,
    }),
}));
