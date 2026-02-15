import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SlotStatus } from "@/entities/schedule";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

interface UpdateScheduleStatusPayload {
  id: number;
  status: SlotStatus;
}

export const useUpdateScheduleStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateScheduleStatusPayload) => {
      await http.patch(`/schedules/${id}`, { status });
    },
    onSuccess: async () => {
      toast.success("스케줄 상태가 변경되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "스케줄 상태 변경에 실패했습니다."));
    },
  });
};

