import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSessionStore } from '@/entities/user';
import { http } from '@/shared/api';
import { clearAccessToken } from '@/shared/lib/auth-token';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui';

type SlotStatus = 'open' | 'closed' | 'cancelled';
type BookingStatus = 'reserved' | 'cancelled' | 'completed';

interface Counselor {
  id: number;
  name: string;
  email: string;
}

interface ScheduleSlot {
  id: number;
  counselor: Counselor;
  startAt: string;
  endAt: string;
  status: SlotStatus;
  capacity: number;
  bookedCount: number;
}

interface BookingItem {
  id: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  status: BookingStatus;
  slot: ScheduleSlot;
}

interface ScheduleQuery {
  from: string;
  to: string;
  counselorId?: number;
}

interface BookingQuery extends ScheduleQuery {
  status?: BookingStatus;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { hour12: false });

const toIso = (value: string) => new Date(value).toISOString();

const getDefaultRange = () => {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 7);

  return {
    from: from.toISOString().slice(0, 16),
    to: to.toISOString().slice(0, 16),
  };
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useSessionStore((state) => state.role);
  const userId = useSessionStore((state) => state.userId);
  const clearSession = useSessionStore((state) => state.clearSession);
  const isAdmin = role === 'admin';

  const initialRange = useMemo(() => getDefaultRange(), []);

  const [scheduleFilter, setScheduleFilter] = useState({
    from: initialRange.from,
    to: initialRange.to,
    counselorId: userId ?? 1,
  });

  const [bookingFilter, setBookingFilter] = useState({
    from: initialRange.from,
    to: initialRange.to,
    counselorId: userId ?? 1,
    status: '' as '' | BookingStatus,
  });

  const [createForm, setCreateForm] = useState({
    counselorId: userId ?? 1,
    startAt: initialRange.from,
    endAt: new Date(new Date(initialRange.from).getTime() + 30 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    capacity: 3,
  });

  const scheduleQueryPayload: ScheduleQuery = {
    from: toIso(scheduleFilter.from),
    to: toIso(scheduleFilter.to),
    ...(isAdmin ? { counselorId: Number(scheduleFilter.counselorId) } : {}),
  };

  const bookingQueryPayload: BookingQuery = {
    from: toIso(bookingFilter.from),
    to: toIso(bookingFilter.to),
    ...(isAdmin ? { counselorId: Number(bookingFilter.counselorId) } : {}),
    ...(bookingFilter.status ? { status: bookingFilter.status } : {}),
  };

  const schedulesQuery = useQuery({
    queryKey: ['schedules', scheduleQueryPayload],
    queryFn: async () => {
      const response = await http.get<ScheduleSlot[]>('/schedules', {
        params: scheduleQueryPayload,
      });
      return response.data;
    },
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings', bookingQueryPayload],
    queryFn: async () => {
      const response = await http.get<BookingItem[]>('/bookings', {
        params: bookingQueryPayload,
      });
      return response.data;
    },
  });

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['schedules'] }),
      queryClient.invalidateQueries({ queryKey: ['bookings'] }),
    ]);
  };

  const createScheduleMutation = useMutation({
    mutationFn: async () => {
      await http.post('/schedules', {
        counselorId: Number(createForm.counselorId),
        startAt: toIso(createForm.startAt),
        endAt: toIso(createForm.endAt),
        capacity: Number(createForm.capacity),
      });
    },
    onSuccess: async () => {
      toast.success('스케줄이 생성되었습니다.');
      await refreshAll();
    },
    onError: () => {
      toast.error('스케줄 생성에 실패했습니다.');
    },
  });

  const updateScheduleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: SlotStatus }) => {
      await http.patch(`/schedules/${id}`, { status });
    },
    onSuccess: async () => {
      toast.success('스케줄 상태를 변경했습니다.');
      await refreshAll();
    },
    onError: () => {
      toast.error('스케줄 상태 변경에 실패했습니다.');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/schedules/${id}`);
    },
    onSuccess: async () => {
      toast.success('스케줄을 삭제했습니다.');
      await refreshAll();
    },
    onError: () => {
      toast.error('스케줄 삭제에 실패했습니다.');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.patch(`/bookings/${id}/cancel`);
    },
    onSuccess: async () => {
      toast.success('예약을 취소했습니다.');
      await refreshAll();
    },
    onError: () => {
      toast.error('예약 취소에 실패했습니다.');
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.patch(`/bookings/${id}/complete`);
    },
    onSuccess: async () => {
      toast.success('예약을 완료 처리했습니다.');
      await refreshAll();
    },
    onError: () => {
      toast.error('예약 완료 처리에 실패했습니다.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await http.post('/auth/logout');
    },
    onSuccess: async () => {
      clearAccessToken();
      clearSession();
      queryClient.clear();
      toast.success('로그아웃되었습니다.');
      navigate('/login', { replace: true });
    },
    onError: () => {
      clearAccessToken();
      clearSession();
      toast.error('세션을 종료하고 로그인 화면으로 이동합니다.');
      navigate('/login', { replace: true });
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-slate-600">
            스케줄 관리와 예약 상태 관리를 한 화면에서 처리할 수 있습니다.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">스케줄 생성</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="create-counselor-id">상담사 ID</Label>
            <Input
              id="create-counselor-id"
              type="number"
              min={1}
              value={createForm.counselorId}
              disabled={!isAdmin}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  counselorId: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-start-at">시작 시각</Label>
            <Input
              id="create-start-at"
              type="datetime-local"
              value={createForm.startAt}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, startAt: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-end-at">종료 시각</Label>
            <Input
              id="create-end-at"
              type="datetime-local"
              value={createForm.endAt}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, endAt: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="create-capacity">정원</Label>
            <Input
              id="create-capacity"
              type="number"
              min={1}
              max={3}
              value={createForm.capacity}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={createScheduleMutation.isPending || !isAdmin}
              onClick={() => createScheduleMutation.mutate()}
            >
              스케줄 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">스케줄 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              type="datetime-local"
              value={scheduleFilter.from}
              onChange={(e) =>
                setScheduleFilter((prev) => ({ ...prev, from: e.target.value }))
              }
            />
            <Input
              type="datetime-local"
              value={scheduleFilter.to}
              onChange={(e) =>
                setScheduleFilter((prev) => ({ ...prev, to: e.target.value }))
              }
            />
            <Input
              type="number"
              min={1}
              disabled={!isAdmin}
              value={scheduleFilter.counselorId}
              onChange={(e) =>
                setScheduleFilter((prev) => ({
                  ...prev,
                  counselorId: Number(e.target.value),
                }))
              }
            />
            <Button onClick={() => schedulesQuery.refetch()} variant="outline">
              조회 새로고침
            </Button>
          </div>

          {schedulesQuery.isLoading && <p className="text-sm text-slate-500">로딩 중...</p>}
          {schedulesQuery.isError && (
            <p className="text-sm text-rose-600">스케줄을 불러오지 못했습니다.</p>
          )}

          <div className="space-y-2">
            {schedulesQuery.data?.map((slot) => (
              <div
                key={slot.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">
                      #{slot.id} | 상담사 {slot.counselor.id} ({slot.counselor.name})
                    </p>
                    <p className="text-slate-600">
                      {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)} | 상태:{' '}
                      {slot.status} | {slot.bookedCount}/{slot.capacity}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="default"
                        variant="outline"
                        onClick={() =>
                          updateScheduleStatusMutation.mutate({
                            id: slot.id,
                            status: slot.status === 'open' ? 'closed' : 'open',
                          })
                        }
                      >
                        {slot.status === 'open' ? '닫기' : '열기'}
                      </Button>
                      <Button
                        size="default"
                        variant="outline"
                        onClick={() => deleteScheduleMutation.mutate(slot.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">예약 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              type="datetime-local"
              value={bookingFilter.from}
              onChange={(e) =>
                setBookingFilter((prev) => ({ ...prev, from: e.target.value }))
              }
            />
            <Input
              type="datetime-local"
              value={bookingFilter.to}
              onChange={(e) =>
                setBookingFilter((prev) => ({ ...prev, to: e.target.value }))
              }
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
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
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
              <div
                key={booking.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
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
    </main>
  );
};
