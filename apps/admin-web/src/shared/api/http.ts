import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { decodeAccessToken } from '@/shared/lib/decode-access-token';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/shared/lib/auth-token';
import { useSessionStore } from '@/entities/user';

type RetryableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const http = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const statusCode = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';

    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (
      statusCode === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post<RefreshResponse>(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const nextAccessToken = refreshResponse.data.accessToken;
        const session = decodeAccessToken(nextAccessToken);

        if (!session) {
          throw new Error('invalid access token');
        }

        setAccessToken(nextAccessToken);
        useSessionStore.getState().setSession(session);
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

        return http(originalRequest);
      } catch {
        clearAccessToken();
        useSessionStore.getState().clearSession();
      }
    }

    return Promise.reject(error);
  },
);

