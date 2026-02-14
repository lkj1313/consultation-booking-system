import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/shared/api';

export const useDeleteScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/schedules/${id}`);
    },
    onSuccess: async () => {
      toast.success('스케줄을 삭제했습니다.');
      await queryClient.invalidateQueries({ queryKey: ['schedules'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      toast.error('스케줄 삭제에 실패했습니다.');
    },
  });
};
