import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { http } from '@/shared/api';

interface CreateBookingPayload {
  slotId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
}

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      await http.post('/bookings', payload);
    },
    onSuccess: async () => {
      toast.success('예약이 완료되었습니다.');
      await queryClient.invalidateQueries({ queryKey: ['available-slots'] });
    },
    onError: () => {
      toast.error('예약에 실패했습니다. 입력값을 확인해 주세요.');
    },
  });
};
