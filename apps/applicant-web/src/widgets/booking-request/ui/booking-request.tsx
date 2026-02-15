import { AppShell } from "@consult/shared-ui";
import { useEffect, useMemo } from "react";
import {
  countItemsByDate,
  filterFutureItems,
  filterItemsByDate,
  getTodayStart,
  isPastDate,
  toDateKey,
} from "@consult/shared-lib";
import { useSearchParams } from "react-router-dom";
import { useBookingRequest } from "../model/use-booking-request";
import {
  BookingCalendarCard,
  BookingConfirmCard,
  BookingLinkNoticeCard,
  BookingTimeCard,
  buildMonthCells,
} from "./booking-request.sections";

export const BookingRequest = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const hasToken = Boolean(token);

  const {
    viewMonth,
    setViewMonth,
    selectedDateKey,
    setSelectedDateKey,
    form,
    setForm,
    slotsQuery,
    createBookingMutation,
    submitBooking,
  } = useBookingRequest(token);

  const now = new Date();
  const todayStart = getTodayStart(now);

  const slots = slotsQuery.data ?? [];
  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const visibleSlots = useMemo(() => filterFutureItems(slots, (slot) => slot.startAt, now), [now, slots]);

  const availableCountByDate = useMemo(
    () => countItemsByDate(visibleSlots, (slot) => slot.startAt),
    [visibleSlots],
  );

  const selectableDateKeys = useMemo(() => new Set(availableCountByDate.keys()), [availableCountByDate]);

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

  useEffect(() => {
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
  }, [monthCells, selectableDateKeys, selectedDateKey, setForm, setSelectedDateKey, todayStart]);

  const moveMonth = (diff: number) => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + diff, 1);
    setViewMonth(next);
    setSelectedDateKey("");
    setForm({ slotId: 0 });
  };

  return (
    <AppShell
      title="상담 예약"
      subtitle="달력에서 가능한 날짜를 고르고, 시간만 선택해 예약을 확정하세요."
      maxWidthClassName="max-w-6xl"
    >
      <BookingLinkNoticeCard hasToken={hasToken} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <BookingCalendarCard
            viewMonth={viewMonth}
            onMoveMonth={moveMonth}
            monthCells={monthCells}
            selectedDateKey={selectedDateKey}
            availableCountByDate={availableCountByDate}
            todayStart={todayStart}
            onSelectDate={(dateKey) => {
              setSelectedDateKey(dateKey);
              setForm({ slotId: 0 });
            }}
          />

          <BookingTimeCard
            isLoading={slotsQuery.isLoading}
            isError={slotsQuery.isError}
            slots={slotsForSelectedDate}
            selectedSlotId={form.slotId}
            onSelectSlot={(slotId) => setForm({ slotId })}
          />
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <BookingConfirmCard
            selectedSlot={selectedSlot}
            isPending={createBookingMutation.isPending}
            canSubmit={hasToken && Boolean(form.slotId)}
            onSubmit={submitBooking}
          />
        </aside>
      </div>
    </AppShell>
  );
};
