import { WEEKDAY_LABELS_KO, formatMonthTitle, isPastDate, toDateKey } from "@consult/shared-lib";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import type { BookingItem } from "@/entities/booking";
import type { ScheduleSlot } from "@/entities/schedule";
import { useCalendarSection } from "../model/use-calendar-section";

interface CalendarSectionProps {
  isAdmin: boolean;
  userId: number | null;
}

const formatDateNoYear = (dateKey: string) => {
  if (!dateKey) {
    return "선택 가능한 날짜 없음";
  }
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

const formatDateTimeNoYear = (iso: string) =>
  new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const CalendarSection = ({ isAdmin, userId }: CalendarSectionProps) => {
  void userId;

  const {
    todayStart,
    viewMonth,
    selectedDateKey,
    setSelectedDateKey,
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
    scheduleCountByDate,
    bookingCountByDate,
    selectedSchedules,
    selectedBookings,
    createTimeOptions,
    isSelectedDatePast,
    moveMonth,
    createSchedule,
  } = useCalendarSection();

  const renderScheduleItem = (slot: ScheduleSlot) => (
    <div key={slot.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">
            {formatDateTimeNoYear(slot.startAt)} - {formatDateTimeNoYear(slot.endAt)} · {slot.counselor.name} 상담
          </p>
          <p className="text-slate-600">
            상태: {slot.status} · 예약 {slot.bookedCount}/{slot.capacity}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                updateScheduleStatusMutation.mutate({
                  id: slot.id,
                  status: slot.status === "open" ? "closed" : "open",
                })
              }
            >
              {slot.status === "open" ? "닫기" : "열기"}
            </Button>
            <Button type="button" variant="outline" onClick={() => deleteScheduleMutation.mutate(slot.id)}>
              삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBookingItem = (booking: BookingItem) => (
    <div key={booking.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">
            {formatDateTimeNoYear(booking.slot.startAt)} · {booking.applicantName} ({booking.applicantEmail})
          </p>
          <p className="text-slate-600">상태: {booking.status}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={booking.status !== "reserved" || cancelBookingMutation.isPending}
            onClick={() => cancelBookingMutation.mutate(booking.id)}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={booking.status !== "reserved" || completeBookingMutation.isPending}
            onClick={() => completeBookingMutation.mutate(booking.id)}
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">예약 캘린더</CardTitle>
          <CardDescription>날짜별 스케줄/예약 건수를 확인하고 같은 화면에서 바로 처리하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" className="h-9 px-3" onClick={() => moveMonth(-1)}>
              이전 달
            </Button>
            <p className="text-base font-semibold text-slate-900">{formatMonthTitle(viewMonth)}</p>
            <Button type="button" variant="outline" className="h-9 px-3" onClick={() => moveMonth(1)}>
              다음 달
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
            {WEEKDAY_LABELS_KO.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthCells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-24 rounded-lg bg-slate-50/70" />;
              }

              const key = toDateKey(cell);
              const scheduleCount = scheduleCountByDate.get(key) ?? 0;
              const bookingCount = bookingCountByDate.get(key) ?? 0;
              const isSelected = selectedDateKey === key;
              const pastDate = isPastDate(cell, todayStart);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={pastDate}
                  onClick={() => {
                    if (!pastDate) {
                      setSelectedDateKey(key);
                    }
                  }}
                  className={`h-24 rounded-lg border p-2 text-left transition ${
                    pastDate
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                      : isSelected
                        ? "border-cyan-400 bg-cyan-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${pastDate ? "text-slate-300" : "text-slate-900"}`}>
                    {cell.getDate()}
                  </p>
                  <p className={`mt-2 text-[11px] ${pastDate ? "text-slate-300" : "text-slate-600"}`}>
                    스케줄 {scheduleCount}건
                  </p>
                  <p className={`text-[11px] ${pastDate ? "text-slate-300" : "text-slate-600"}`}>
                    예약 {bookingCount}건
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">선택 날짜 스케줄</CardTitle>
            <CardDescription>{formatDateNoYear(selectedDateKey)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isAdmin && (
              <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_100px_auto]">
                <select
                  value={createTime}
                  onChange={(event) => setCreateTime(event.target.value)}
                  disabled={isSelectedDatePast || createTimeOptions.length === 0}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  {createTimeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <select
                  value={createCapacity}
                  onChange={(event) => setCreateCapacity(Number(event.target.value))}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value={1}>정원 1</option>
                  <option value={2}>정원 2</option>
                  <option value={3}>정원 3</option>
                </select>
                <Button
                  type="button"
                  disabled={createScheduleMutation.isPending || isSelectedDatePast || createTimeOptions.length === 0}
                  onClick={createSchedule}
                >
                  스케줄 생성
                </Button>
              </div>
            )}

            {schedulesQuery.isLoading && <p className="text-sm text-slate-500">스케줄 불러오는 중...</p>}
            {schedulesQuery.isError && <p className="text-sm text-rose-600">스케줄 조회에 실패했습니다.</p>}
            {!schedulesQuery.isLoading && !schedulesQuery.isError && selectedSchedules.length === 0 && (
              <p className="text-sm text-slate-600">선택한 날짜의 스케줄이 없습니다.</p>
            )}
            {selectedSchedules.map(renderScheduleItem)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">선택 날짜 예약</CardTitle>
            <CardDescription>{formatDateNoYear(selectedDateKey)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingsQuery.isLoading && <p className="text-sm text-slate-500">예약 불러오는 중...</p>}
            {bookingsQuery.isError && <p className="text-sm text-rose-600">예약 조회에 실패했습니다.</p>}
            {!bookingsQuery.isLoading && !bookingsQuery.isError && selectedBookings.length === 0 && (
              <p className="text-sm text-slate-600">선택한 날짜의 예약이 없습니다.</p>
            )}
            {selectedBookings.map(renderBookingItem)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
