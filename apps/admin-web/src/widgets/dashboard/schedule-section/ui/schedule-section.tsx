import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DateTimePicker30m,
  Input,
  Label,
} from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/date-time';
import { useScheduleSection } from '../model/use-schedule-section';

interface ScheduleSectionProps {
  isAdmin: boolean;
  userId: number | null;
}

export const ScheduleSection = ({ isAdmin, userId }: ScheduleSectionProps) => {
  const {
    scheduleFilter,
    setScheduleFilter,
    createForm,
    setCreateForm,
    setCreateStartAt,
    schedulesQuery,
    createScheduleMutation,
    updateScheduleStatusMutation,
    deleteScheduleMutation,
  } = useScheduleSection({ isAdmin, userId });

  const selectedCounselorId = Number(scheduleFilter.counselorId);
  const canCreate = Number.isInteger(selectedCounselorId) && selectedCounselorId > 0;

  return (
    <>
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">스케줄 생성</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="create-start-at">시작 시간</Label>
              <DateTimePicker30m value={createForm.startAt} onChange={setCreateStartAt} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="create-end-at">종료 시간</Label>
              <DateTimePicker30m value={createForm.endAt} onChange={() => {}} disabled />
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
                disabled={createScheduleMutation.isPending || !canCreate}
                onClick={() =>
                  createScheduleMutation.mutate({
                    ...createForm,
                    counselorId: selectedCounselorId,
                  })
                }
              >
                생성
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">스케줄 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <DateTimePicker30m
              value={scheduleFilter.from}
              onChange={(next) => setScheduleFilter((prev) => ({ ...prev, from: next }))}
            />
            <DateTimePicker30m
              value={scheduleFilter.to}
              onChange={(next) => setScheduleFilter((prev) => ({ ...prev, to: next }))}
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
              <div key={slot.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
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
    </>
  );
};
