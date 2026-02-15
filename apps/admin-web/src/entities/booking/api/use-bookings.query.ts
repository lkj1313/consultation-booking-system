import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import type { BookingItem, BookingQuery } from '../model/types';

export const useBookingsQuery = (params: BookingQuery) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const response = await http.get<BookingItem[]>('/bookings', { params });
      return response.data;
    },
  });
