import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { decodeAccessToken } from '@/shared/lib/decode-access-token';
import { setAccessToken } from '@/shared/lib/auth-token';
import { useSessionStore } from '@/entities/user';
import { loginUser, type LoginPayload, type LoginResponse } from '../api/login-user';

type ErrorResponse = {
  message?: string | string[];
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ErrorResponse | undefined;
    const message = response?.message;

    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    if (error.response?.status === 404) {
      return '로그인 API가 아직 준비되지 않았습니다.';
    }
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

export const useLoginMutation = (onSuccess?: (data: LoginResponse) => void) => {
  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const session = decodeAccessToken(data.accessToken);
      if (!session) {
        toast.error('토큰 해석에 실패했습니다. 다시 로그인해 주세요.');
        return;
      }

      setAccessToken(data.accessToken);
      useSessionStore.getState().setSession(session);

      toast.success('로그인에 성공했습니다.');
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};

