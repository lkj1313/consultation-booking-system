import {
  TIME_OPTIONS_30M,
  addMinutes,
  buildMonthCells,
  countItemsByDate,
  filterFutureItems,
  filterItemsByDate,
  getTodayStart,
  isPastDate,
  startOfMonth,
  startOfNextMonth,
  toDateKey,
} from "@consult/shared-lib";
import { useEffect, useMemo, useState } from "react";
import { useBookingsQuery } from "@/entities/booking";
import { useSchedulesQuery } from "@/entities/schedule";
import { useCancelBookingMutation } from "@/features/cancel-booking";
import { useCompleteBookingMutation } from "@/features/complete-booking";
import { useCreateScheduleMutation } from "@/features/create-schedule";
import { useDeleteScheduleMutation } from "@/features/delete-schedule";
import { useSaveConsultationNoteMutation } from "@/features/save-consultation-note";
import { useUpdateScheduleStatusMutation } from "@/features/update-schedule-status";

export const useCalendarSection = (userId: number | null) => {
  const [now, setNow] = useState(() => new Date());
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedNoteBookingId, setSelectedNoteBookingId] = useState<number | null>(null);
  const [createTime, setCreateTime] = useState("09:00");
  const [createCapacity, setCreateCapacity] = useState(3);
  const [noteEditorDraft, setNoteEditorDraft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const todayStart = useMemo(() => getTodayStart(now), [now]);
  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const queryRange = useMemo(
    () => ({
      from: startOfMonth(viewMonth).toISOString(),
      to: startOfNextMonth(viewMonth).toISOString(),
      ...(userId ? { counselorId: userId } : {}),
    }),
    [userId, viewMonth],
  );

  const schedulesQuery = useSchedulesQuery(queryRange);
  const bookingsQuery = useBookingsQuery(queryRange);
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleStatusMutation = useUpdateScheduleStatusMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();
  const cancelBookingMutation = useCancelBookingMutation();
  const completeBookingMutation = useCompleteBookingMutation();
  const saveConsultationNoteMutation = useSaveConsultationNoteMutation();

  const schedules = schedulesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];

  const visibleSchedules = useMemo(
    () => filterFutureItems(schedules, (slot) => slot.startAt, now),
    [now, schedules],
  );
  const visibleBookings = useMemo(
    () => filterFutureItems(bookings, (booking) => booking.slot.startAt, now),
    [bookings, now],
  );

  const scheduleCountByDate = useMemo(
    () => countItemsByDate(visibleSchedules, (slot) => slot.startAt),
    [visibleSchedules],
  );
  const bookingCountByDate = useMemo(
    () => countItemsByDate(visibleBookings, (booking) => booking.slot.startAt),
    [visibleBookings],
  );

  useEffect(() => {
    if (!selectedDateKey) {
      const firstSelectable = monthCells.find((cell) => cell && !isPastDate(cell, todayStart));
      setSelectedDateKey(firstSelectable ? toDateKey(firstSelectable) : "");
      return;
    }

    const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
    const selectedInCurrentMonth =
      selectedDate.getFullYear() === viewMonth.getFullYear() &&
      selectedDate.getMonth() === viewMonth.getMonth();

    if (!selectedInCurrentMonth || isPastDate(selectedDate, todayStart)) {
      const firstSelectable = monthCells.find((cell) => cell && !isPastDate(cell, todayStart));
      setSelectedDateKey(firstSelectable ? toDateKey(firstSelectable) : "");
    }
  }, [monthCells, selectedDateKey, todayStart, viewMonth]);

  const selectedSchedules = useMemo(
    () =>
      filterItemsByDate(visibleSchedules, selectedDateKey, (slot) => slot.startAt).sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    [selectedDateKey, visibleSchedules],
  );
  const selectedBookings = useMemo(
    () =>
      filterItemsByDate(visibleBookings, selectedDateKey, (booking) => booking.slot.startAt).sort(
        (a, b) => new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime(),
      ),
    [selectedDateKey, visibleBookings],
  );
  const selectedSlot = useMemo(
    () => selectedSchedules.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSchedules, selectedSlotId],
  );
  const selectedSlotBookings = useMemo(
    () =>
      selectedSlotId === null
        ? []
        : selectedBookings.filter((booking) => booking.slot.id === selectedSlotId),
    [selectedBookings, selectedSlotId],
  );
  const selectedNoteBooking = useMemo(
    () =>
      selectedNoteBookingId === null
        ? null
        : selectedSlotBookings.find((booking) => booking.id === selectedNoteBookingId) ?? null,
    [selectedNoteBookingId, selectedSlotBookings],
  );

  useEffect(() => {
    if (!selectedSlotId) {
      setSelectedNoteBookingId(null);
      setNoteEditorDraft("");
      return;
    }

    if (!selectedSchedules.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(null);
      setSelectedNoteBookingId(null);
      setNoteEditorDraft("");
    }
  }, [selectedSchedules, selectedSlotId]);

  useEffect(() => {
    if (selectedSlotBookings.length === 0) {
      setSelectedNoteBookingId(null);
      return;
    }

    if (
      selectedNoteBookingId &&
      !selectedSlotBookings.some((booking) => booking.id === selectedNoteBookingId)
    ) {
      setSelectedNoteBookingId(null);
    }
  }, [selectedNoteBookingId, selectedSlotBookings]);

  useEffect(() => {
    if (!selectedNoteBooking) {
      setNoteEditorDraft("");
      return;
    }
    setNoteEditorDraft(selectedNoteBooking.consultationNote?.note ?? "");
  }, [selectedNoteBooking]);

  const createTimeOptions = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
    const isToday = toDateKey(selectedDate) === toDateKey(todayStart);

    if (!isToday) {
      return TIME_OPTIONS_30M;
    }

    return TIME_OPTIONS_30M.filter((time) => {
      const dateTime = new Date(`${selectedDateKey}T${time}:00`);
      return dateTime.getTime() >= now.getTime();
    });
  }, [now, selectedDateKey, todayStart]);

  useEffect(() => {
    if (createTimeOptions.length === 0) {
      return;
    }
    if (!createTimeOptions.includes(createTime)) {
      setCreateTime(createTimeOptions[0]);
    }
  }, [createTime, createTimeOptions]);

  const isSelectedDatePast = useMemo(() => {
    if (!selectedDateKey) {
      return true;
    }
    return isPastDate(new Date(`${selectedDateKey}T00:00:00`), todayStart);
  }, [selectedDateKey, todayStart]);

  const moveMonth = (diff: number) => {
    setViewMonth((prev) =>
      startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + diff, 1)),
    );
  };

  const createSchedule = () => {
    if (!selectedDateKey || createTimeOptions.length === 0) {
      return;
    }

    const startAt = `${selectedDateKey}T${createTime}`;
    const endAt = addMinutes(startAt, 30);

    createScheduleMutation.mutate({
      startAt,
      endAt,
      capacity: createCapacity,
    });
  };

  return {
    now,
    todayStart,
    viewMonth,
    selectedDateKey,
    setSelectedDateKey,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    selectedNoteBookingId,
    setSelectedNoteBookingId,
    selectedNoteBooking,
    noteEditorDraft,
    setNoteEditorDraft,
    createTime,
    setCreateTime,
    createCapacity,
    setCreateCapacity,
    monthCells,
    schedulesQuery,
    bookingsQuery,
    createScheduleMutation,
    updateScheduleStatusMutation,
    deleteScheduleMutation,
    cancelBookingMutation,
    completeBookingMutation,
    saveConsultationNoteMutation,
    scheduleCountByDate,
    bookingCountByDate,
    selectedSchedules,
    selectedBookings,
    selectedSlotBookings,
    createTimeOptions,
    isSelectedDatePast,
    moveMonth,
    createSchedule,
  };
};
