import type { AuthTokenResponse } from '@consult/shared-types';
import axios from 'axios';
import { useSessionStore } from '@/entities/user';
import { clearAccessToken, setAccessToken } from './auth-token';
import { decodeAccessToken } from './decode-access-token';

type RefreshResponse = AuthTokenResponse;

export const bootstrapAuth = async (): Promise<boolean> => {
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  try {
    const response = await axios.post<RefreshResponse>(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    const session = decodeAccessToken(response.data.accessToken);
    if (!session) {
      throw new Error('invalid access token');
    }

    setAccessToken(response.data.accessToken);
    useSessionStore.getState().setSession(session);

    return true;
  } catch {
    clearAccessToken();
    useSessionStore.getState().clearSession();

    return false;
  }
};

