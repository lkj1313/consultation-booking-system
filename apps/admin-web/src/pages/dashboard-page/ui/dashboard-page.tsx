import { AppShell, Button } from "@/shared/ui";
import { useSessionStore } from "@/entities/user";
import { useLogoutMutation } from "@/features/logout";
import { BookingLinkSection } from "@/widgets/dashboard/booking-link-section";
import { CalendarSection } from "@/widgets/dashboard/calendar-section";

export const DashboardPage = () => {
  const role = useSessionStore((state) => state.role);
  const userId = useSessionStore((state) => state.userId);
  const isAdmin = role === "admin";
  const logoutMutation = useLogoutMutation();

  return (
    <AppShell
      title="관리자 대시보드"
      subtitle="스케줄 관리, 예약 링크 발송, 예약 상태 변경을 한 화면에서 처리합니다."
      maxWidthClassName="max-w-7xl"
      actions={
        <Button
          variant="outline"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
        </Button>
      }
    >
      <CalendarSection isAdmin={isAdmin} userId={userId} />
      <BookingLinkSection />
    </AppShell>
  );
};
