'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import type { ChatListItem } from '@/lib/types';
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
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token);

  const { data, isLoading, isError } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery,
  });

  const rows = data ?? [];

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats step 1</p>
      <p className="mt-2 text-sm text-ink-muted">
        canQuery={String(canQuery)} hydrated={String(hasHydrated)} token={String(Boolean(token))}{' '}
        session=
        {sessionStatus}
      </p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>

      <div className="mt-4 w-full max-w-xl text-left text-sm text-ink">
        {isLoading ? <div>Loading…</div> : null}
        {isError ? <div>Failed to load chats</div> : null}
        {!isLoading && !isError && rows.length === 0 ? <div>No chats</div> : null}
        {!isLoading && !isError && rows.length > 0 ? (
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
