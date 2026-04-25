'use client';

import { QueryClient } from '@tanstack/react-query';

declare global {
  var __PULSE_QUERY_CLIENT__: QueryClient | undefined;
}

function createQueryClient() {
  return new QueryClient({
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
}

/**
 * Stable QueryClient singleton across renders and Fast Refresh.
 * Important: never create a new QueryClient inside a React component.
 */
export function getQueryClient() {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.__PULSE_QUERY_CLIENT__) {
      globalThis.__PULSE_QUERY_CLIENT__ = createQueryClient();
    }
    return globalThis.__PULSE_QUERY_CLIENT__;
  }
  // Extremely defensive fallback (should never happen in browser).
  return createQueryClient();
}
