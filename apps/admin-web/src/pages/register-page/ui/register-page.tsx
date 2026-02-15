import { AppShell } from "@/shared/ui";
import { RegisterForm } from "@/features/register";

export const RegisterPage = () => {
  return (
    <AppShell
      title="상담사 등록"
      subtitle="상담사 계정을 생성하고 로그인할 수 있습니다."
      maxWidthClassName="max-w-md"
      className="flex items-center justify-center py-0 md:py-0"
    >
      <RegisterForm />
    </AppShell>
  );
};
