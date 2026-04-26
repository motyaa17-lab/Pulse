'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import type { ChatListItem } from '@/lib/types';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const router = useRouter();
  const params = useSearchParams();
  const start = params.get('start');
  const qc = useQueryClient();
  const t = useT();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token) && sessionStatus === 'ok';

  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery,
  });

  useEffect(() => {
    console.count('[EFFECT] chats/page start-param');
    console.log('deps:', { canQuery, start });
    const run = async () => {
      if (!canQuery) return;
      if (start) {
        try {
          const chat = await getOrCreateDirectChat(start);
          console.count('[ACTION] chats/page invalidate chats');
          console.log('deps:', { chatId: chat?.id ?? null });
          void qc.invalidateQueries({ queryKey: ['chats'] });
          console.count('[ACTION] chats/page router.replace start');
          console.log('deps:', { to: `/chats/${chat.id}` });
          router.replace(`/chats/${chat.id}`);
        } catch {
          console.count('[ACTION] chats/page router.replace fallback');
          console.log('deps:', { to: '/chats' });
          router.replace('/chats');
        }
        return;
      }
    };
    void run();
  }, [canQuery, qc, router, start]);

  // TEMP: desktop auto-open-first is disabled to isolate crashes after navigating into a chat thread.
  // (Previously: router.replace(chatHref(first)) on desktop split-view.)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
              stroke="currentColor"
              className="text-ink-muted"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-4 font-display text-xl font-semibold text-ink">{t('openingInbox')}</p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">{t('syncingChats')}</p>
      </div>
    );
  }

  const hasAnyChats = (data?.length ?? 0) > 0;
  if (!hasAnyChats) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
              stroke="currentColor"
              className="text-ink-muted"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-4 font-display text-xl font-semibold text-ink">
          {t('noConversationsYet')}
        </p>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">
          Start a direct chat from Search (
          <kbd className="rounded border border-line/70 px-1 py-px text-[11px]">Ctrl</kbd>+
          <kbd className="rounded border border-line/70 px-1 py-px text-[11px]">K</kbd>), or invite
          someone to message you.
        </p>
      </div>
    );
  }

  // Desktop: auto-open happens in effect above; keep a lightweight placeholder while it runs.
  // Mobile: list is rendered by layout; this panel stays mostly unused.
  return (
    <div className="hidden h-full flex-col items-center justify-center px-6 text-center text-sm text-ink-muted md:flex">
      <p className="font-medium text-ink">{t('openingChat')}</p>
    </div>
  );
}
