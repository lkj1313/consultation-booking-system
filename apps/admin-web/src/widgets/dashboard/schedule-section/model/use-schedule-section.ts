import { useMemo, useState } from 'react';
import { useCreateScheduleMutation } from '@/features/create-schedule';
import { useDeleteScheduleMutation } from '@/features/delete-schedule';
import { useUpdateScheduleStatusMutation } from '@/features/update-schedule-status';
import { useSchedulesQuery } from '@/entities/schedule';
import type { ScheduleQuery } from '@/entities/schedule';
import { addMinutes, floorToThirtyMinutes, getDefaultRange, toDateTimeLocal, toIso } from '@/shared/lib/date-time';

interface UseScheduleSectionParams {
  isAdmin: boolean;
  userId: number | null;
}

export const useScheduleSection = ({ isAdmin, userId }: UseScheduleSectionParams) => {
  const initialRange = useMemo(() => getDefaultRange(), []);

  const [scheduleFilter, setScheduleFilter] = useState({
    from: initialRange.from,
    to: initialRange.to,
    counselorId: userId ?? 1,
  });

  const [createForm, setCreateForm] = useState({
    startAt: initialRange.from,
    endAt: addMinutes(initialRange.from, 30),
    capacity: 3,
  });

  const setCreateStartAt = (raw: string) => {
    if (!raw) {
      return;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    const snapped = toDateTimeLocal(floorToThirtyMinutes(parsed));
    setCreateForm((prev) => ({
      ...prev,
      startAt: snapped,
      endAt: addMinutes(snapped, 30),
    }));
  };

  const queryPayload: ScheduleQuery = {
    from: toIso(scheduleFilter.from),
    to: toIso(scheduleFilter.to),
    ...(isAdmin ? { counselorId: Number(scheduleFilter.counselorId) } : {}),
  };

  const schedulesQuery = useSchedulesQuery(queryPayload);
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleStatusMutation = useUpdateScheduleStatusMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();

  return {
    isAdmin,
    scheduleFilter,
    setScheduleFilter,
    createForm,
    setCreateForm,
    setCreateStartAt,
    schedulesQuery,
    createScheduleMutation,
    updateScheduleStatusMutation,
    deleteScheduleMutation,
  };
};

export type UseScheduleSectionResult = ReturnType<typeof useScheduleSection>;
