'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api';
import type { ChatListItem } from '@/lib/types';
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

  const { data, isLoading, isError, error } = useQuery<ChatListItem[]>({
    queryKey: ['chats-apiFetch'],
    queryFn: async () => apiFetch<ChatListItem[]>('/chats'),
    enabled: Boolean(token),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const rows = data ?? [];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats static query</p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>

      <div className="mt-4 w-full max-w-xl text-left text-sm text-ink">
        {isLoading ? <div>Loading…</div> : null}
        {isError ? (
          <div>Error: {error instanceof Error ? error.message : 'Failed to load chats'}</div>
        ) : null}
        {!isLoading && !isError ? (
          <div className="space-y-1">
            {rows.map((c) => (
              <div key={c.id}>
                {(c.title ?? c.peer?.displayName ?? c.peer?.username ?? '(no name)') + ' — ' + c.id}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
