import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string | string[];
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "요청 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.",
) => {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const response = error.response?.data as ApiErrorResponse | undefined;
  const message = response?.message;

  if (Array.isArray(message) && message.length > 0 && typeof message[0] === "string") {
    return message[0];
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return fallback;
};

