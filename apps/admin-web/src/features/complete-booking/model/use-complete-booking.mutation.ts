import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await http.patch(`/bookings/${id}/complete`);
    },
    onSuccess: async () => {
      toast.success("예약이 완료 처리되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "예약 완료 처리에 실패했습니다."));
    },
  });
};

