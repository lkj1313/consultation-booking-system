import { AppShell } from "@/shared/ui";
import { LoginForm } from "@/features/login";

export const LoginPage = () => {
  return (
    <AppShell
      title="관리자 로그인"
      subtitle="상담 예약 시스템 운영 화면에 접속합니다."
      maxWidthClassName="max-w-md"
    >
      <LoginForm />
    </AppShell>
  );
};

