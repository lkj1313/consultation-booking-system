import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import type { AvailableSlot, AvailableSlotsQuery } from '../model/types';

export const useAvailableSlotsQuery = (params: AvailableSlotsQuery) =>
  useQuery({
    queryKey: ['available-slots', params],
    queryFn: async () => {
      const response = await http.get<AvailableSlot[]>('/bookings/available-slots', {
        params,
      });
      return response.data;
    },
  });
