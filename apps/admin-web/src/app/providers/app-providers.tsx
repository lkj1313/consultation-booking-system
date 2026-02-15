import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingSpinner } from '@consult/shared-ui';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { bootstrapAuth } from '@/shared/lib/bootstrap-auth';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runBootstrap = async () => {
      await bootstrapAuth();

      if (isMounted) {
        setIsBootstrapping(false);
      }
    };

    void runBootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isBootstrapping) {
    return <LoadingSpinner message="인증 정보를 확인하고 있습니다..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
};

