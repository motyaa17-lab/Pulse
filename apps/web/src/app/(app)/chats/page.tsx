'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import type { ChatListItem } from '@/lib/types';
import { useT } from '@/lib/i18n';

export default function ChatsIndexPage() {
  const t = useT();
  return (
    <Suspense
      fallback={
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
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">
            Getting things ready. This usually takes a moment.
          </p>
        </div>
      }
    >
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

  const { data, isLoading } = useQuery<ChatListItem[]>({
    queryKey: ['chats', ''],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
  });

  useEffect(() => {
    const run = async () => {
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
  }, [qc, router, start]);

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

  // When chats exist, we intentionally do not auto-navigate.
  // Desktop uses split view; mobile shows the list in layout.
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-ink-muted">
      <p className="font-medium text-ink">{t('openingChat')}</p>
    </div>
  );
}
