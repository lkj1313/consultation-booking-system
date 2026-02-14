import { RegisterForm } from '@/features/register';

export const RegisterPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">관리자 사용자 등록</h1>
        <p className="text-sm text-slate-600">
          상담 예약 시스템에서 관리자 계정을 생성합니다.
        </p>
        <RegisterForm />
      </section>
    </main>
  );
};
