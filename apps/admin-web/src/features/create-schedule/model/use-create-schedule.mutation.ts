import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/shared/api';

interface CreateSchedulePayload {
  counselorId: number;
  startAt: string;
  endAt: string;
  capacity: number;
}

export const useCreateScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSchedulePayload) => {
      await http.post('/schedules', {
        counselorId: Number(payload.counselorId),
        startAt: new Date(payload.startAt).toISOString(),
        endAt: new Date(payload.endAt).toISOString(),
        capacity: Number(payload.capacity),
      });
    },
    onSuccess: async () => {
      toast.success('스케줄이 생성되었습니다.');
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      toast.error('스케줄 생성에 실패했습니다.');
    },
  });
};
