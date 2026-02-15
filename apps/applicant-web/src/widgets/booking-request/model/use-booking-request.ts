import { useEffect, useMemo, useState } from "react";
import {
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
import { toast } from "sonner";
import type { AvailableSlot } from "@/entities/slot";
import { useAvailableSlotsQuery } from "@/entities/slot";
import { useCreateBookingMutation } from "@/features/create-booking";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";

export const useBookingRequest = (token: string | null) => {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [form, setForm] = useState({
    slotId: 0,
  });
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<AvailableSlot | null>(null);

  const queryPayload = useMemo(
    () => ({
      token: token ?? "",
      from: startOfMonth(viewMonth).toISOString(),
      to: startOfNextMonth(viewMonth).toISOString(),
    }),
    [token, viewMonth],
  );

  const slotsQuery = useAvailableSlotsQuery(queryPayload);
  const createBookingMutation = useCreateBookingMutation();
  const now = new Date();
  const todayStart = getTodayStart(now);
  const slots = slotsQuery.data ?? [];
  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const visibleSlots = useMemo(
    () => filterFutureItems(slots, (slot) => slot.startAt, now),
    [now, slots],
  );
  const availableCountByDate = useMemo(
    () => countItemsByDate(visibleSlots, (slot) => slot.startAt),
    [visibleSlots],
  );
  const selectableDateKeys = useMemo(
    () => new Set(availableCountByDate.keys()),
    [availableCountByDate],
  );
  const slotsForSelectedDate = useMemo(
    () =>
      filterItemsByDate(visibleSlots, selectedDateKey, (slot) => slot.startAt).sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    [selectedDateKey, visibleSlots],
  );
  const selectedSlot = useMemo(
    () => slotsForSelectedDate.find((slot) => slot.id === form.slotId) ?? null,
    [form.slotId, slotsForSelectedDate],
  );
  const slotsErrorMessage = useMemo(
    () =>
      slotsQuery.isError
        ? getApiErrorMessage(slotsQuery.error, "예약 정보를 확인할 수 없습니다.")
        : null,
    [slotsQuery.error, slotsQuery.isError],
  );
  const isAlreadyBookedLink = useMemo(() => {
    if (!slotsErrorMessage) {
      return false;
    }
    return /이미\s*사용|이미\s*예약|already\s*used|already\s*booked/i.test(
      slotsErrorMessage,
    );
  }, [slotsErrorMessage]);
  const interactionDisabled = isBooked || isAlreadyBookedLink;

  useEffect(() => {
    if (interactionDisabled) {
      return;
    }

    if (selectedDateKey && selectableDateKeys.has(selectedDateKey)) {
      return;
    }

    const firstSelectable = monthCells.find((cell) => {
      if (!cell) {
        return false;
      }
      const key = toDateKey(cell);
      return selectableDateKeys.has(key) && !isPastDate(cell, todayStart);
    });

    setSelectedDateKey(firstSelectable ? toDateKey(firstSelectable) : "");
    setForm({ slotId: 0 });
  }, [
    interactionDisabled,
    monthCells,
    selectableDateKeys,
    selectedDateKey,
    setForm,
    setSelectedDateKey,
    todayStart,
  ]);

  const submitBooking = async (selectedSlot: AvailableSlot | null) => {
    if (!form.slotId) {
      return;
    }

    try {
      await createBookingMutation.mutateAsync({
        token: token ?? "",
        slotId: Number(form.slotId),
      });
      setIsBooked(true);
      setConfirmedSlot(selectedSlot);
      toast.success("예약이 완료되었습니다.");
    } catch {
      // 에러 토스트는 mutation 훅의 onError에서 처리한다.
    }
  };

  const moveMonth = (diff: number) => {
    if (interactionDisabled) {
      return;
    }

    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + diff, 1);
    setViewMonth(next);
    setSelectedDateKey("");
    setForm({ slotId: 0 });
  };

  const selectDate = (dateKey: string) => {
    if (interactionDisabled) {
      return;
    }
    setSelectedDateKey(dateKey);
    setForm({ slotId: 0 });
  };

  const selectSlot = (slotId: number) => {
    setForm({ slotId });
  };

  return {
    viewMonth,
    monthCells,
    todayStart,
    moveMonth,
    selectedDateKey,
    selectDate,
    form,
    selectSlot,
    availableCountByDate,
    slotsForSelectedDate,
    selectedSlot,
    isBooked,
    confirmedSlot,
    slotsErrorMessage,
    isAlreadyBookedLink,
    interactionDisabled,
    slotsQuery,
    createBookingMutation,
    submitBooking,
  };
};
