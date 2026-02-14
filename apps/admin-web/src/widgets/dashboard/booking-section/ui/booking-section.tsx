import type { BookingStatus } from '@/entities/booking';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DateTimePicker30m,
  Input,
} from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/date-time';
import { useBookingSection } from '../model/use-booking-section';

interface BookingSectionProps {
  isAdmin: boolean;
  userId: number | null;
}

export const BookingSection = ({ isAdmin, userId }: BookingSectionProps) => {
  const {
    bookingFilter,
    setBookingFilter,
    bookingsQuery,
    cancelBookingMutation,
    completeBookingMutation,
  } = useBookingSection({ isAdmin, userId });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">예약 목록</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <DateTimePicker30m
            value={bookingFilter.from}
            onChange={(next) => setBookingFilter((prev) => ({ ...prev, from: next }))}
          />
          <DateTimePicker30m
            value={bookingFilter.to}
            onChange={(next) => setBookingFilter((prev) => ({ ...prev, to: next }))}
          />
          <Input
            type="number"
            min={1}
            disabled={!isAdmin}
            value={bookingFilter.counselorId}
            onChange={(e) =>
              setBookingFilter((prev) => ({
                ...prev,
                counselorId: Number(e.target.value),
              }))
            }
          />
          <select
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm"
            value={bookingFilter.status}
            onChange={(e) =>
              setBookingFilter((prev) => ({
                ...prev,
                status: e.target.value as '' | BookingStatus,
              }))
            }
          >
            <option value="">전체 상태</option>
            <option value="reserved">reserved</option>
            <option value="cancelled">cancelled</option>
            <option value="completed">completed</option>
          </select>
          <Button onClick={() => bookingsQuery.refetch()} variant="outline">
            조회 새로고침
          </Button>
        </div>

        {bookingsQuery.isLoading && <p className="text-sm text-slate-500">로딩 중...</p>}
        {bookingsQuery.isError && (
          <p className="text-sm text-rose-600">예약 목록을 불러오지 못했습니다.</p>
        )}

        <div className="space-y-2">
          {bookingsQuery.data?.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    #{booking.id} | {booking.applicantName} ({booking.applicantEmail})
                  </p>
                  <p className="text-slate-600">
                    슬롯 #{booking.slot.id} | {formatDateTime(booking.slot.startAt)} | 상태:{' '}
                    {booking.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={booking.status !== 'reserved' || cancelBookingMutation.isPending}
                    onClick={() => cancelBookingMutation.mutate(booking.id)}
                  >
                    취소
                  </Button>
                  <Button
                    disabled={booking.status !== 'reserved' || completeBookingMutation.isPending}
                    onClick={() => completeBookingMutation.mutate(booking.id)}
                  >
                    완료
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
