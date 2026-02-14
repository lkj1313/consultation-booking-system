import { Button } from "@/shared/ui";
import { useSessionStore } from "@/entities/user";
import { useLogoutMutation } from "@/features/logout";
import { ScheduleSection } from "@/widgets/dashboard/schedule-section";
import { BookingSection } from "@/widgets/dashboard/booking-section";

export const DashboardPage = () => {
  const role = useSessionStore((state) => state.role);
  const userId = useSessionStore((state) => state.userId);
  const isAdmin = role === "admin";
  const logoutMutation = useLogoutMutation();

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
          {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
        </Button>
      </section>

      <ScheduleSection isAdmin={isAdmin} userId={userId} />
      <BookingSection isAdmin={isAdmin} userId={userId} />
    </main>
  );
};
