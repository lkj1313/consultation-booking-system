import type { ReactNode } from 'react';

interface LoadingSpinnerProps {
  message?: ReactNode;
}

export const LoadingSpinner = ({
  message = '로딩 중입니다...',
}: LoadingSpinnerProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-600">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
