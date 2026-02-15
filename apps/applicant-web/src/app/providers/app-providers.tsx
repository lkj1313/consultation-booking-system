import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
};
