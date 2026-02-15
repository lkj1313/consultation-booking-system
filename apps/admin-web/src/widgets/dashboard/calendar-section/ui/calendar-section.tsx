import {
  WEEKDAY_LABELS_KO,
  formatDateTimeNoYear,
  formatMonthTitle,
  isPastDate,
  toDateKey,
} from "@consult/shared-lib";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Modal } from "@/shared/ui";
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

export const CalendarSection = ({ isAdmin, userId }: CalendarSectionProps) => {
  const {
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
    selectedSlotBookings,
    createTimeOptions,
    isSelectedDatePast,
    moveMonth,
    createSchedule,
  } = useCalendarSection(userId);

  const renderScheduleItem = (slot: ScheduleSlot) => {
    const isSelected = selectedSlotId === slot.id;

    return (
      <button
        key={slot.id}
        type="button"
        onClick={() => setSelectedSlotId(slot.id)}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-left text-sm transition ${
          isSelected ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">
            {formatDateTimeNoYear(slot.startAt)} - {formatDateTimeNoYear(slot.endAt)} · {slot.counselor.name} 상담
          </p>
          <p className="text-slate-600">
            상태: {slot.status} · 예약 {slot.bookedCount}/{slot.capacity}
          </p>
          <p className="text-xs text-slate-500">클릭하면 해당 슬롯 예약 내역을 볼 수 있습니다.</p>
        </div>
        {isAdmin && (
          <div
            className="flex gap-2"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
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
      </button>
    );
  };

  const renderBookingItem = (booking: BookingItem) => {
    const applicantName =
      booking.applicantName?.trim() || booking.applicantEmail.split("@")[0]?.trim() || "신청자";
    const isSelected = selectedNoteBookingId === booking.id;

    return (
      <div key={booking.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium text-slate-900">
              {formatDateTimeNoYear(booking.slot.startAt)} · 신청자 {applicantName}
            </p>
            <p className="text-slate-600">이메일: {booking.applicantEmail}</p>
            <p className="text-slate-600">상태: {booking.status}</p>
            <p className="text-xs text-slate-500">
              상담 이력: {booking.consultationNote?.note ? "작성됨" : "없음"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setSelectedNoteBookingId(booking.id)}
            >
              {isSelected ? "이력 작성 중" : "이력 작성"}
            </Button>
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
  };

  const selectedNoteBookingName = selectedNoteBooking
    ? selectedNoteBooking.applicantName?.trim() ||
      selectedNoteBooking.applicantEmail.split("@")[0]?.trim() ||
      "신청자"
    : "";
  const isSelectedNoteBookingCompleted = selectedNoteBooking?.status === "completed";

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
                      setSelectedSlotId(null);
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
            <CardTitle className="text-lg">선택 슬롯 예약 내역</CardTitle>
            <CardDescription>
              {selectedSlot
                ? `${formatDateTimeNoYear(selectedSlot.startAt)} - ${formatDateTimeNoYear(selectedSlot.endAt)}`
                : "스케줄을 클릭하면 해당 슬롯 예약 내역이 표시됩니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingsQuery.isLoading && <p className="text-sm text-slate-500">예약 불러오는 중...</p>}
            {bookingsQuery.isError && <p className="text-sm text-rose-600">예약 조회에 실패했습니다.</p>}
            {!bookingsQuery.isLoading && !bookingsQuery.isError && !selectedSlot && (
              <p className="text-sm text-slate-600">왼쪽 스케줄에서 시간대를 선택해 주세요.</p>
            )}
            {!bookingsQuery.isLoading &&
              !bookingsQuery.isError &&
              selectedSlot &&
              selectedSlotBookings.length === 0 && (
                <p className="text-sm text-slate-600">선택한 슬롯의 예약이 없습니다.</p>
              )}
            {selectedSlotBookings.map(renderBookingItem)}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={Boolean(selectedNoteBooking)}
        title={selectedNoteBooking ? `상담 이력 작성 · ${selectedNoteBookingName}` : "상담 이력 작성"}
        description={
          selectedNoteBooking
            ? `${formatDateTimeNoYear(selectedNoteBooking.slot.startAt)} · 상태 ${selectedNoteBooking.status}`
            : undefined
        }
        onClose={() => setSelectedNoteBookingId(null)}
        footer={
          <Button
            type="button"
            className="h-11 px-4"
            disabled={
              !isSelectedNoteBookingCompleted ||
              noteEditorDraft.trim().length === 0 ||
              saveConsultationNoteMutation.isPending ||
              !selectedNoteBooking
            }
            onClick={() =>
              selectedNoteBooking &&
              saveConsultationNoteMutation.mutate(
                {
                  bookingId: selectedNoteBooking.id,
                  note: noteEditorDraft.trim(),
                },
                {
                  onSuccess: () => setSelectedNoteBookingId(null),
                },
              )
            }
          >
            이력 저장
          </Button>
        }
      >
        <p className="text-sm text-slate-600">
          {isSelectedNoteBookingCompleted
            ? "상담 완료 상태입니다. 상담 이력을 저장할 수 있습니다."
            : "상담 완료 상태에서만 이력 저장이 가능합니다."}
        </p>
        <textarea
          value={noteEditorDraft}
          onChange={(event) => setNoteEditorDraft(event.target.value)}
          placeholder="상담 내용, 후속 조치, 다음 일정 등을 기록하세요."
          disabled={!isSelectedNoteBookingCompleted}
          className="mt-3 min-h-40 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-cyan-400 disabled:bg-slate-100"
        />
      </Modal>
    </div>
  );
};
