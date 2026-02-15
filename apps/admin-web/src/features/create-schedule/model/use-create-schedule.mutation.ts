import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateScheduleRequest } from "@consult/shared-types";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useCreateScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateScheduleRequest) => {
      await http.post("/schedules", {
        startAt: new Date(payload.startAt).toISOString(),
        endAt: new Date(payload.endAt).toISOString(),
        capacity: Number(payload.capacity),
      });
    },
    onSuccess: async () => {
      toast.success("스케줄이 생성되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["schedules"] });
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "스케줄 생성에 실패했습니다."));
    },
  });
};
