'use client';

import { QueryClient } from '@tanstack/react-query';

// Singleton QueryClient to avoid re-creation / re-subscription loops.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // In production we prefer explicit refetches over implicit loops.
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
    },
  },
});
