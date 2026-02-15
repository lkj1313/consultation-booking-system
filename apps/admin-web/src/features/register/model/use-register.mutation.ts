import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { RegisterUserPayload, RegisterUserResponse } from '@/entities/user';
import { registerUser } from '../api/register-user';

type ValidationErrorResponse = {
  message?: string | string[];
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ValidationErrorResponse | undefined;
    const message = response?.message;

    if (Array.isArray(message) && message.length > 0) {
      return message[0];
    }

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

export const useRegisterMutation = (
  onSuccess?: (data: RegisterUserResponse) => void,
) => {
  return useMutation<RegisterUserResponse, unknown, RegisterUserPayload>({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success('사용자 등록이 완료되었습니다.');
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
