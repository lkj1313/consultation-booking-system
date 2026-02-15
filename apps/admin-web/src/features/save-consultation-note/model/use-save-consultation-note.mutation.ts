import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpsertConsultationNoteRequest } from "@consult/shared-types";
import { toast } from "sonner";
import { http } from "@/shared/api";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useSaveConsultationNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertConsultationNoteRequest) => {
      await http.post("/consultation-notes", payload);
    },
    onSuccess: async () => {
      toast.success("상담 이력이 저장되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "상담 이력 저장에 실패했습니다."));
    },
  });
};
