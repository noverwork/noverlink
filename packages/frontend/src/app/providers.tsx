'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode,useEffect, useState } from 'react';

import { authStore } from '@/lib/auth-store';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    authStore.init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
