import { AppShell } from "@consult/shared-ui";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useBookingRequest } from "../model/use-booking-request";
import {
  BookingCalendarCard,
  BookingConfirmCard,
  BookingLinkNoticeCard,
  BookingTimeCard,
} from "./booking-request.sections";

export const BookingRequest = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const hasToken = Boolean(token);

  const {
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
  } = useBookingRequest(token);

  return (
    <AppShell
      title="상담 예약"
      subtitle="달력에서 가능한 날짜를 고르고, 시간만 선택해 예약을 확정하세요."
      maxWidthClassName="max-w-6xl"
    >
      <BookingLinkNoticeCard
        hasToken={hasToken}
        linkErrorMessage={slotsErrorMessage}
        isAlreadyBookedLink={isAlreadyBookedLink}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <BookingCalendarCard
            viewMonth={viewMonth}
            onMoveMonth={moveMonth}
            monthCells={monthCells}
            selectedDateKey={selectedDateKey}
            availableCountByDate={availableCountByDate}
            todayStart={todayStart}
            interactionDisabled={interactionDisabled}
            onSelectDate={selectDate}
          />

          {!interactionDisabled && (
            <BookingTimeCard
              isLoading={slotsQuery.isLoading}
              isError={slotsQuery.isError}
              errorMessage={slotsErrorMessage}
              slots={slotsForSelectedDate}
              selectedSlotId={form.slotId}
              onSelectSlot={selectSlot}
            />
          )}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <BookingConfirmCard
            selectedSlot={isBooked ? confirmedSlot : selectedSlot}
            isPending={createBookingMutation.isPending}
            isBooked={isBooked}
            isAlreadyBookedLink={isAlreadyBookedLink}
            canSubmit={!interactionDisabled && hasToken && Boolean(form.slotId)}
            onSubmit={() => submitBooking(selectedSlot)}
          />
        </aside>
      </div>
    </AppShell>
  );
};
