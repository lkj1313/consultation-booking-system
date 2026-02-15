import { AppShell } from "@/shared/ui";
import { RegisterForm } from "@/features/register";

export const RegisterPage = () => {
  return (
    <AppShell
      title="관리자 사용자 등록"
      subtitle="운영 담당자 계정을 생성하고 권한을 부여합니다."
      maxWidthClassName="max-w-md"
      className="flex items-center justify-center py-0 md:py-0"
    >
      <RegisterForm />
    </AppShell>
  );
};
