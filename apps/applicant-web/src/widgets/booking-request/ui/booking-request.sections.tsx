import {
  WEEKDAY_LABELS_KO,
  buildMonthCells,
  formatDateTime,
  formatMonthTitle,
  isPastDate,
  toDateKey,
} from "@consult/shared-lib";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@consult/shared-ui";
import type { AvailableSlot } from "@/entities/slot";

export { buildMonthCells, isPastDate, toDateKey };

interface BookingLinkNoticeCardProps {
  hasToken: boolean;
}

export const BookingLinkNoticeCard = ({ hasToken }: BookingLinkNoticeCardProps) => {
  if (hasToken) {
    return null;
  }

  return (
    <Card className="border-rose-200">
      <CardHeader>
        <CardTitle>예약 링크가 필요합니다.</CardTitle>
        <CardDescription>이메일 링크(`/reserve?token=...`)로 접속해 주세요.</CardDescription>
      </CardHeader>
    </Card>
  );
};

interface BookingCalendarCardProps {
  viewMonth: Date;
  onMoveMonth: (diff: number) => void;
  monthCells: Array<Date | null>;
  selectedDateKey: string;
  availableCountByDate: Map<string, number>;
  todayStart: Date;
  onSelectDate: (dateKey: string) => void;
}

export const BookingCalendarCard = ({
  viewMonth,
  onMoveMonth,
  monthCells,
  selectedDateKey,
  availableCountByDate,
  todayStart,
  onSelectDate,
}: BookingCalendarCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">1. 날짜 선택</CardTitle>
        <CardDescription>예약 가능한 날짜는 칸에 `가능 n건`으로 표시됩니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" className="h-9 px-3" onClick={() => onMoveMonth(-1)}>
            이전 달
          </Button>
          <p className="text-base font-semibold text-slate-900">{formatMonthTitle(viewMonth)}</p>
          <Button type="button" variant="outline" className="h-9 px-3" onClick={() => onMoveMonth(1)}>
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
              return <div key={`empty-${index}`} className="h-20 rounded-lg bg-slate-50/60" />;
            }

            const key = toDateKey(cell);
            const availableCount = availableCountByDate.get(key) ?? 0;
            const isSelected = selectedDateKey === key;
            const disabled = isPastDate(cell, todayStart) || availableCount === 0;

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                className={`h-20 rounded-lg border p-2 text-left transition ${
                  disabled
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                    : isSelected
                      ? "border-cyan-400 bg-cyan-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                onClick={() => {
                  if (!disabled) {
                    onSelectDate(key);
                  }
                }}
              >
                <p className={`text-sm font-semibold ${disabled ? "text-slate-300" : "text-slate-900"}`}>
                  {cell.getDate()}
                </p>
                <p className={`mt-2 text-[11px] ${disabled ? "text-slate-300" : "text-cyan-700"}`}>
                  {availableCount > 0 ? `가능 ${availableCount}건` : "선택 불가"}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface BookingTimeCardProps {
  isLoading: boolean;
  isError: boolean;
  slots: AvailableSlot[];
  selectedSlotId: number;
  onSelectSlot: (slotId: number) => void;
}

export const BookingTimeCard = ({
  isLoading,
  isError,
  slots,
  selectedSlotId,
  onSelectSlot,
}: BookingTimeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">2. 시간 선택</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && <p className="text-sm text-slate-500">달력 정보를 불러오는 중...</p>}
        {isError && <p className="text-sm text-rose-600">시간 정보를 불러오지 못했습니다. 다시 시도해 주세요.</p>}
        {!isLoading && !isError && slots.length === 0 && (
          <p className="text-sm text-slate-600">선택한 날짜에는 예약 가능한 시간이 없습니다.</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(slot.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{formatDateTime(slot.startAt)}</p>
                <p className="mt-1 text-xs text-slate-600">종료 {formatDateTime(slot.endAt)}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface BookingConfirmCardProps {
  selectedSlot: AvailableSlot | null;
  isPending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}

export const BookingConfirmCard = ({ selectedSlot, isPending, canSubmit, onSubmit }: BookingConfirmCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">3. 예약 확정</CardTitle>
        <CardDescription>신청자 정보는 예약 링크 이메일로 자동 처리됩니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedSlot ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-900">선택한 시간</p>
            <p className="mt-1 text-slate-700">{formatDateTime(selectedSlot.startAt)}</p>
            <p className="text-slate-600">종료 {formatDateTime(selectedSlot.endAt)}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-600">달력에서 날짜를 선택한 뒤 시간을 고르세요.</p>
        )}

        <Button className="w-full" disabled={!canSubmit || isPending} onClick={onSubmit}>
          {isPending ? "예약 처리 중..." : "예약 확정"}
        </Button>
      </CardContent>
    </Card>
  );
};
