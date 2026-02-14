import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/shared/api';

export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await http.patch(`/bookings/${id}/complete`);
    },
    onSuccess: async () => {
      toast.success('예약을 완료 처리했습니다.');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: () => {
      toast.error('예약 완료 처리에 실패했습니다.');
    },
  });
};
