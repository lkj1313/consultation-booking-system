import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await http.patch(`/bookings/${id}/cancel`);
    },
    onSuccess: async () => {
      toast.success("예약이 취소되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "예약 취소에 실패했습니다."));
    },
  });
};

