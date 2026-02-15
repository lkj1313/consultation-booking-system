import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBookingRequest } from "@consult/shared-types";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingRequest) => {
      await http.post("/bookings", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "예약 요청에 실패했습니다."));
    },
  });
};
