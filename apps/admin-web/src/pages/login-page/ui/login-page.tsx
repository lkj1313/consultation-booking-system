import { AppShell } from "@/shared/ui";
import { LoginForm } from "@/features/login";

export const LoginPage = () => {
  return (
    <AppShell
      title="상담사 로그인"
      subtitle="상담 예약 시스템 상담사 화면에 접속합니다."
      maxWidthClassName="max-w-md"
      className="flex items-center justify-center py-0 md:py-0"
    >
      <LoginForm />
    </AppShell>
  );
};
