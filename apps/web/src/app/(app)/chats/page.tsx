'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
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
    <div className="flex h-full">
      <aside className="w-[360px] shrink-0 border-r border-line/60 bg-surface/60 dark:border-white/[0.08] dark:bg-black/10">
        <div className="px-4 py-3">
          <div className="text-sm font-semibold text-ink">{t('chats')}</div>
          <div className="mt-0.5 text-xs text-ink-muted/80">{t('openingInbox')}</div>
        </div>

        <div className="h-[calc(100%-56px)] overflow-y-auto px-2 pb-3">
          {isLoading ? <div className="px-2 py-2 text-sm text-ink-muted">Loading…</div> : null}
          {isError ? (
            <div className="px-2 py-2 text-sm text-ink-muted">
              Error: {error instanceof Error ? error.message : 'Failed to load chats'}
            </div>
          ) : null}

          {!isLoading && !isError && rows.length === 0 ? (
            <div className="px-2 py-2 text-sm text-ink-muted">No chats</div>
          ) : null}

          {!isLoading && !isError && rows.length > 0 ? (
            <div className="space-y-1">
              {rows.map((c) => {
                const title = c.title ?? c.peer?.displayName ?? c.peer?.username ?? '(no name)';
                const preview = (c.lastMessagePreview ?? '').trim();
                const unread = c.unreadCount ?? 0;
                const online = Boolean(c.peer?.isOnline);
                const avatarUrl = c.avatarUrl ?? c.peer?.avatarUrl ?? null;
                const avatarLabel = (title || '?').slice(0, 1).toUpperCase();

                return (
                  <button
                    key={c.id}
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface-elevated/70 dark:hover:bg-white/[0.06]"
                    onClick={() => console.log('[CHAT CLICK]', c.id)}
                  >
                    <div className="relative">
                      <SafeAvatar
                        url={avatarUrl}
                        label={avatarLabel}
                        className="h-11 w-11 shrink-0 rounded-full ring-1 ring-line/60 dark:ring-white/[0.10]"
                        fallbackClassName="text-sm font-semibold text-sky-200"
                      />
                      {online ? (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-surface dark:ring-black/60" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink dark:text-white">
                          {title}
                        </div>
                        {unread > 0 ? (
                          <div className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-bold text-white">
                            {unread > 999 ? '999+' : unread}
                          </div>
                        ) : null}
                      </div>
                      {preview ? (
                        <div className="mt-0.5 truncate text-[13px] text-ink-muted">{preview}</div>
                      ) : (
                        <div className="mt-0.5 truncate text-[13px] text-ink-muted/70"> </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-sm text-ink-muted">Выберите чат</div>
      </main>
    </div>
  );
}
