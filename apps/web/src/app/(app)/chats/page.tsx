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
  const params = useSearchParams();
  const start = params.get('start');
  const qc = useQueryClient();
  const t = useT();
  const didAutoOpenDesktop = useRef(false);
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
    const run = async () => {
      if (!canQuery) return;
      if (start) {
        try {
          const chat = await getOrCreateDirectChat(start);
          void qc.invalidateQueries({ queryKey: ['chats'] });
          router.replace(`/chats/${chat.id}`);
        } catch {
          router.replace('/chats');
        }
        return;
      }
    };
    void run();
  }, [canQuery, qc, router, start]);

  // Desktop split-view UX: auto-open the first chat once (never on mobile).
  useEffect(() => {
    if (!canQuery) return;
    if (start) return;
    if (isLoading) return;
    if (didAutoOpenDesktop.current) return;
    const bare = pathname?.split('?')[0] ?? '';
    if (bare !== '/chats' && bare !== '/chats/') return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 769px)').matches) return;

    if (!firstChatId || !firstChatType) return;

    // In production we can occasionally bounce between routes during boot; ensure auto-open runs once
    // per browser session to avoid navigation loops.
    try {
      const k = 'pulse:autoOpenDesktopChatsDone';
      if (window.sessionStorage.getItem(k) === '1') return;
      window.sessionStorage.setItem(k, '1');
    } catch {
      // ignore
    }

    didAutoOpenDesktop.current = true;
    const target = chatHref({ id: firstChatId, type: firstChatType } as any);
    if (target === bare) return;
    router.replace(target);
  }, [canQuery, firstChatId, firstChatType, isLoading, pathname, router, start]);

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
