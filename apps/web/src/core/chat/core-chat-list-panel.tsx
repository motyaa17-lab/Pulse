'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { cn } from '@/lib/cn';
import type { ChatListItem } from '@/lib/types';
import { coreApiFetch, CoreApiError } from '@/core/api/core-api';
import { useCoreAuthStore } from '@/core/state/core-auth-store';

export function CoreChatListPanel() {
  const pathname = usePathname();
  const bare = pathname?.split('?')[0] ?? '';
  const activeChatId = (() => {
    const parts = bare.split('/').filter(Boolean);
    return parts[0] === 'core' && parts[1] === 'chats' && parts[2] ? parts[2] : null;
  })();

  const token = useCoreAuthStore((s) => s.accessToken);
  const hasHydrated = useCoreAuthStore((s) => s.hasHydrated);
  const canQuery = hasHydrated && Boolean(token);

  const { data, isLoading, isError, error } = useQuery<ChatListItem[]>({
    queryKey: ['core-chats'],
    queryFn: () => coreApiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const unauthorized =
    isError && error instanceof CoreApiError && (error.status === 401 || error.status === 403);

  const rows = data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="px-4 pb-3">
        <input
          placeholder="Поиск"
          className="w-full rounded-2xl border border-line/60 bg-surface-elevated/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-4 focus:ring-sky-400/15 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/45"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-surface-elevated/70 px-3 py-2 text-xs font-semibold text-ink ring-1 ring-line/60 dark:bg-white/[0.06] dark:text-white/90 dark:ring-white/[0.10]"
          >
            Все
          </button>
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink dark:text-white/55 dark:hover:text-white/85"
          >
            Непрочитанные
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {isLoading ? <div className="px-3 py-2 text-sm text-ink-muted">Загрузка…</div> : null}
        {unauthorized ? (
          <div className="px-3 py-2 text-sm text-ink-muted">Нужно войти заново</div>
        ) : null}
        {isError && !unauthorized ? (
          <div className="px-3 py-2 text-sm text-ink-muted">Ошибка загрузки чатов</div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <div className="px-3 py-2 text-sm text-ink-muted">Нет чатов</div>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="space-y-1">
            {rows.map((c) => {
              const title = c.title ?? c.peer?.displayName ?? c.peer?.username ?? '(без названия)';
              const preview = (c.lastMessagePreview ?? '').trim();
              const unread = c.unreadCount ?? 0;
              const online = Boolean(c.peer?.isOnline);
              const avatarUrl = c.avatarUrl ?? c.peer?.avatarUrl ?? null;
              const avatarLabel = (title || '?').slice(0, 1).toUpperCase();
              const active = activeChatId === c.id;

              return (
                <Link
                  key={c.id}
                  href={`/core/chats/${c.id}`}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-2xl px-3 py-2 transition',
                    active
                      ? 'bg-surface-elevated/90 ring-1 ring-line/70 dark:bg-white/[0.08] dark:ring-white/[0.14]'
                      : 'hover:bg-surface-elevated/70 dark:hover:bg-white/[0.06]',
                  )}
                >
                  <div className="relative">
                    <SafeAvatar
                      url={avatarUrl}
                      label={avatarLabel}
                      className="h-12 w-12 shrink-0 rounded-full ring-1 ring-line/60 dark:ring-white/[0.10]"
                      fallbackClassName="text-sm font-semibold text-sky-200"
                    />
                    {online ? (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-surface-muted dark:ring-[rgb(var(--tg-panel))]" />
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
                    <div className="mt-0.5 truncate text-[13px] text-ink-muted dark:text-white/55">
                      {preview || ' '}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
