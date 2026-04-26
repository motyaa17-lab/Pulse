'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import type { ChatListItem } from '@/lib/types';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { chatHref } from '@/lib/chat-route';
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
  const pathname = usePathname();
  const pathnameBare = pathname?.split('?')[0] ?? '';
  const params = useSearchParams();
  const start = params.get('start');
  const qc = useQueryClient();
  const t = useT();
  const didAutoOpenDesktop = useRef(false);
  const didInitialAutoOpenRef = useRef(false);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token) && sessionStatus === 'ok';

  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery,
  });

  const chatsLen = data?.length ?? 0;
  const firstChat = chatsLen > 0 ? data![0] : null;
  const firstChatId = firstChat?.id ?? null;
  const firstChatType = firstChat?.type ?? null;

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

  // Desktop split-view UX: auto-open the first chat once (never on mobile).
  useEffect(() => {
    console.count('[EFFECT] chats/page auto-open-first');
    console.log('deps:', {
      canQuery,
      start,
      isLoading,
      didAutoOpenDesktop: didAutoOpenDesktop.current,
      pathnameBare: pathnameBare || null,
      firstChatId,
      firstChatType,
      didInitialAutoOpen: didInitialAutoOpenRef.current,
    });
    if (!canQuery) return;
    if (isLoading) return;
    if (start) return;
    if (didInitialAutoOpenRef.current) return;
    if (pathnameBare !== '/chats' && pathnameBare !== '/chats/') return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    if (!firstChatId || !firstChatType) return;

    const target = chatHref({ id: firstChatId, type: firstChatType } as any);
    if (target === pathnameBare) return;

    // Critical: run at most once per /chats page-load to avoid navigation loops.
    didInitialAutoOpenRef.current = true;
    didAutoOpenDesktop.current = true;
    console.count('[ACTION] chats/page router.replace auto-open-first');
    console.log('deps:', { from: pathnameBare, to: target });
    router.replace(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canQuery, isLoading, pathnameBare, firstChatId, firstChatType]);

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
