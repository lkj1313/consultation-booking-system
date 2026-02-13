import { LoginForm } from "@/features/auth/login";

export const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">관리자 로그인</h1>
        <p className="text-sm text-slate-600">
          상담 예약 시스템 관리자 페이지에 로그인합니다.
        </p>
        <LoginForm />
      </section>
    </main>
  );
};
