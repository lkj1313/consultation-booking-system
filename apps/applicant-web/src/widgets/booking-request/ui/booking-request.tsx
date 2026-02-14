import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateTimePicker30m,
  Input,
  Label,
} from '@consult/shared-ui';
import { formatDateTime } from '@consult/shared-lib';
import { useBookingRequest } from '../model/use-booking-request';

export const BookingRequest = () => {
  const { filter, setFilter, form, setForm, slotsQuery, createBookingMutation, submitBooking } =
    useBookingRequest();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>상담 예약 요청</CardTitle>
          <CardDescription>원하는 시간을 선택하고 신청자 정보를 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="filter-from">조회 시작</Label>
            <DateTimePicker30m
              value={filter.from}
              onChange={(next) => setFilter((prev) => ({ ...prev, from: next }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-to">조회 종료</Label>
            <DateTimePicker30m
              value={filter.to}
              onChange={(next) => setFilter((prev) => ({ ...prev, to: next }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-counselor-id">상담사 ID</Label>
            <Input
              id="filter-counselor-id"
              type="number"
              min={1}
              value={filter.counselorId}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, counselorId: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" variant="outline" onClick={() => slotsQuery.refetch()}>
              예약 가능한 시간 조회
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">예약 가능한 시간대</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {slotsQuery.isLoading && <p className="text-sm text-slate-500">로딩 중...</p>}
          {slotsQuery.isError && (
            <p className="text-sm text-rose-600">예약 가능한 시간대를 불러오지 못했습니다.</p>
          )}
          {slotsQuery.data?.map((slot) => (
            <label
              key={slot.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  #{slot.id} | 상담사 {slot.counselor.name}
                </p>
                <p className="text-slate-600">
                  {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)} | 잔여:{' '}
                  {slot.capacity - slot.bookedCount}
                </p>
              </div>
              <input
                type="radio"
                name="slotId"
                value={slot.id}
                checked={form.slotId === slot.id}
                onChange={() => setForm((prev) => ({ ...prev, slotId: slot.id }))}
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">신청자 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="applicant-name">이름</Label>
            <Input
              id="applicant-name"
              value={form.applicantName}
              onChange={(e) => setForm((prev) => ({ ...prev, applicantName: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="applicant-email">이메일</Label>
            <Input
              id="applicant-email"
              type="email"
              value={form.applicantEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, applicantEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="applicant-phone">연락처(선택)</Label>
            <Input
              id="applicant-phone"
              value={form.applicantPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, applicantPhone: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Button
              className="w-full"
              disabled={createBookingMutation.isPending || !form.slotId}
              onClick={submitBooking}
            >
              {createBookingMutation.isPending ? '예약 요청 중...' : '예약 요청'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
