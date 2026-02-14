import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/shared/api';
import type { SlotStatus } from '@/entities/schedule';

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
      toast.success('스케줄 상태를 변경했습니다.');
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: () => {
      toast.error('스케줄 상태 변경에 실패했습니다.');
    },
  });
};
