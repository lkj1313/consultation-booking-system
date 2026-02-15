import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api';
import type { ScheduleQuery, ScheduleSlot } from '../model/types';

export const useSchedulesQuery = (params: ScheduleQuery) =>
  useQuery({
    queryKey: ['schedules', params],
    queryFn: async () => {
      const response = await http.get<ScheduleSlot[]>('/schedules', { params });
      return response.data;
    },
  });
