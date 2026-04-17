'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, toPublicUrl } from '@/lib/api';
import { MessageThread } from '@/components/pulse/message-thread';
import {
  ChatDetailsDrawer,
  type ChatDetailForDrawer,
} from '@/components/pulse/chat-details-drawer';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/cn';
import { connectSocket } from '@/lib/socket';
import type { MeUserDto } from '@/lib/types';
import { useT } from '@/lib/i18n';

function typeLabel(t: (k: any) => string, type: string | undefined): string {
  switch (type) {
    case 'DIRECT':
      return t('directMessage');
    case 'GROUP':
      return t('group');
    case 'CHANNEL':
      return t('channel');
    case 'SAVED':
      return t('saved');
    default:
      return type ?? '';
  }
}

export default function ChatPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const router = useRouter();
  const qc = useQueryClient();
  const detailsOpen = useUiStore((s) => s.detailsOpen);
  const setDetailsOpen = useUiStore((s) => s.setDetailsOpen);
  const typing = useUiStore((s) => s.typingByChat?.[chatId] ?? false);
  const setTyping = useUiStore((s) => s.setTypingForChat);
  const t = useT();

  useEffect(() => {
    setDetailsOpen(false);
  }, [chatId, setDetailsOpen]);

  useEffect(() => {
    const s = connectSocket();
    const joinRoom = () => s.emit('chat:join', { chatId });
    if (s.connected) joinRoom();
    s.on('connect', joinRoom);
    const onTyping = (payload: unknown) => {
      const p = payload as { chatId?: string; userIds?: string[] };
      if (!p?.chatId || p.chatId !== chatId) return;
      const myId = qc.getQueryData<MeUserDto>(['me'])?.id;
      const ids = (p.userIds ?? []).filter((id) => id && id !== myId);
      setTyping(chatId, ids.length > 0);
    };
    s.on('typing:update', onTyping);
    return () => {
      s.off('connect', joinRoom);
      s.emit('chat:leave', { chatId });
      s.off('typing:update', onTyping);
      setTyping(chatId, false);
    };
  }, [chatId, qc, setTyping]);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
  });

  const title =
    chat?.title ?? chat?.peer?.displayName ?? chat?.peer?.username ?? t('conversationFallback');

  const avatarSrc = toPublicUrl(chat?.avatarUrl ?? chat?.peer?.avatarUrl ?? null);
  const peerId = chat?.type === 'DIRECT' ? chat?.peer?.id : null;
  const status =
    chat?.type === 'DIRECT' && chat?.peer
      ? chat.peer.isOnline
        ? t('online')
        : chat.peer.lastSeenAt
          ? t('lastSeenRecently')
          : t('offline')
      : typeLabel(t as any, chat?.type);
  const statusText = typing && chat?.type === 'DIRECT' ? t('typing') : status;
  const initial = title.slice(0, 1).toUpperCase() || '?';
  const pinned = chat?.pinnedMessage ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#070B14] text-white md:bg-transparent md:text-inherit">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        <header
          className={cn(
            'flex shrink-0 items-center gap-2.5 px-3',
            'sticky top-0 z-20 border-b border-white/10 bg-white/8 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[28px]',
            'md:static md:z-auto md:border-b md:border-line/75 md:bg-surface-elevated/98 md:py-1.5 md:pt-1.5 md:shadow-[0_1px_0_rgba(0,0,0,0.04)] md:backdrop-blur-md dark:md:border-line/45 dark:md:bg-surface-elevated/95 dark:md:shadow-[0_1px_0_rgba(255,255,255,0.04)]',
          )}
        >
          <button
            type="button"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition md:hidden',
              'border border-white/12 bg-white/8 text-white/85 hover:bg-white/12 hover:text-white active:scale-[0.99]',
            )}
            onClick={() => router.push('/chats')}
            aria-label={t('backToChatListAria')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {peerId ? (
            <Link
              href={`/users/${peerId}`}
              className="relative h-9 w-9 shrink-0 md:h-10 md:w-10"
              aria-label={t('openProfileAria')}
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  className={cn(
                    'h-9 w-9 rounded-full object-cover transition md:h-10 md:w-10',
                    'ring-1 ring-white/15 md:ring-line/55 md:hover:ring-accent/35 dark:md:ring-line/35',
                  )}
                />
              ) : (
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 transition hover:ring-accent/35 md:h-10 md:w-10 md:text-sm',
                    'border border-white/12 bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white ring-white/15',
                    'md:border-transparent md:bg-gradient-to-br md:from-accent/30 md:to-accent/10 md:text-accent md:ring-line/45 dark:md:from-accent/25 dark:md:to-accent/5',
                  )}
                >
                  {initial}
                </div>
              )}
            </Link>
          ) : (
            <div className="relative h-9 w-9 shrink-0 md:h-10 md:w-10">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt=""
                  className={cn(
                    'h-9 w-9 rounded-full object-cover md:h-10 md:w-10',
                    'ring-1 ring-white/15 md:ring-line/55 dark:md:ring-line/35',
                  )}
                />
              ) : (
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 md:h-10 md:w-10 md:text-sm',
                    'border border-white/12 bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white ring-white/15',
                    'md:border-transparent md:bg-gradient-to-br md:from-accent/30 md:to-accent/10 md:text-accent dark:md:from-accent/25 dark:md:to-accent/5',
                  )}
                >
                  {initial}
                </div>
              )}
            </div>
          )}
          <div className="min-w-0 flex-1 py-0.5">
            <h1
              className={cn(
                'truncate font-display text-[1.02rem] font-semibold leading-tight tracking-tight md:text-[1.0625rem]',
                'text-white md:text-ink',
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                'mt-0.5 truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em]',
                'text-white/55 md:text-ink-muted/85',
              )}
            >
              {statusText}
            </p>
          </div>
          <button
            type="button"
            className={cn(
              'inline-flex h-9 shrink-0 items-center rounded-full px-3 text-[0.65rem] font-bold uppercase tracking-[0.14em] transition',
              'border border-white/12 bg-white/8 text-white/75 hover:bg-white/12 hover:text-white active:scale-[0.99]',
              'md:border-line/75 md:bg-transparent md:text-ink-muted md:hover:border-accent/35 md:hover:bg-surface-muted/55 md:hover:text-ink dark:md:border-line/50 dark:md:hover:bg-surface-elevated/55',
            )}
            onClick={() => setDetailsOpen(true)}
          >
            {t('info')}
          </button>
        </header>
        {pinned && (
          <button
            type="button"
            onClick={() => router.push(`/chats/${chatId}?highlight=${pinned.id}`)}
            className={cn(
              'flex shrink-0 items-center gap-2 px-3 py-2 text-left text-sm',
              'border-b border-white/10 bg-white/6 text-white/70 hover:bg-white/10',
              'md:border-b md:border-line/60 md:bg-surface-elevated/90 md:text-ink-muted md:hover:bg-surface-muted/60 dark:md:border-line/45 dark:md:bg-surface-elevated/95',
            )}
            aria-label={t('pinnedMessageAria')}
          >
            <span className="inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
              {t('pinnedBadge')}
            </span>
            <span className={cn('min-w-0 flex-1 truncate text-[13px]', 'text-white md:text-ink')}>
              {pinned.deletedAt
                ? t('messageDeleted')
                : pinned.text?.trim()
                  ? pinned.text
                  : t('attachment')}
            </span>
            <span
              className={cn('shrink-0 text-[11px] font-semibold', 'text-sky-300 md:text-accent')}
            >
              {t('view')}
            </span>
          </button>
        )}
        <ChatDetailsDrawer open={detailsOpen} onClose={() => setDetailsOpen(false)} chat={chat} />
        {chatId && <MessageThread chatId={chatId} />}
      </div>
    </div>
  );
}
