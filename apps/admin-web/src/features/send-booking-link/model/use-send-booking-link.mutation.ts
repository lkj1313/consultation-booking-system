import { useMutation } from "@tanstack/react-query";
import type { CreateBookingLinkRequest, CreateBookingLinkResponse } from "@consult/shared-types";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useSendBookingLinkMutation = () =>
  useMutation({
    mutationFn: async (payload: CreateBookingLinkRequest) => {
      const response = await http.post<CreateBookingLinkResponse>("/booking-links", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "예약 링크 이메일 발송이 완료되었습니다.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "예약 링크 이메일 발송에 실패했습니다."));
    },
  });
