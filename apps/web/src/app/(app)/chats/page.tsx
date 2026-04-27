'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { API_URL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const t = useT();
  const token = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, error } = useQuery<unknown[]>({
    queryKey: ['chats-raw-fetch'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/chats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as unknown[];
    },
    enabled: Boolean(token),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const count = Array.isArray(data) ? data.length : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats static query</p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>

      <div className="mt-4 w-full max-w-xl text-left text-sm text-ink">
        {isLoading ? <div>Loading…</div> : null}
        {isError ? (
          <div>Error: {error instanceof Error ? error.message : 'Failed to load chats'}</div>
        ) : null}
        {!isLoading && !isError ? <div>Chats count: {count}</div> : null}
      </div>
    </div>
  );
}
