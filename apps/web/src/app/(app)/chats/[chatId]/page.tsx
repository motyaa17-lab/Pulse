'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { MessageThread } from '@/components/pulse/message-thread';
import {
  ChatDetailsDrawer,
  type ChatDetailForDrawer,
} from '@/components/pulse/chat-details-drawer';
import { ChatSearchOverlay } from '@/components/pulse/chat-search-overlay';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/cn';
import { connectSocket } from '@/lib/socket';
import type { ChatListItem, MeUserDto } from '@/lib/types';
import { useT } from '@/lib/i18n';
import { directChatPresenceSubtitle } from '@/lib/format-last-seen';
import { useLanguageStore } from '@/stores/language-store';

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
  const language = useLanguageStore((s) => s.language);
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);

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
    const onPresence = (payload: unknown) => {
      const p = payload as { userId?: string; online?: boolean };
      if (!p?.userId) return;
      const peer = qc.getQueryData<ChatDetailForDrawer>(['chat', chatId])?.peer;
      if (peer?.id === p.userId) {
        qc.setQueryData<ChatDetailForDrawer | undefined>(['chat', chatId], (old) => {
          if (!old?.peer || old.peer.id !== p.userId) return old;
          return { ...old, peer: { ...old.peer, isOnline: Boolean(p.online) } };
        });
      }
      qc.setQueriesData<ChatListItem[]>({ queryKey: ['chats'] }, (old) => {
        if (!old) return old;
        let hit = false;
        const next = old.map((c) => {
          if (c.type !== 'DIRECT' || c.peer?.id !== p.userId) return c;
          hit = true;
          return { ...c, peer: c.peer ? { ...c.peer, isOnline: Boolean(p.online) } : c.peer };
        });
        return hit ? next : old;
      });
    };
    s.on('typing:update', onTyping);
    s.on('presence:update', onPresence);
    return () => {
      s.off('connect', joinRoom);
      s.emit('chat:leave', { chatId });
      s.off('typing:update', onTyping);
      s.off('presence:update', onPresence);
      setTyping(chatId, false);
    };
  }, [chatId, qc, setTyping]);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
  });

  const title =
    chat?.title ?? chat?.peer?.displayName ?? chat?.peer?.username ?? t('conversationFallback');

  const tabTitleBaseline = useRef<string | null>(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (tabTitleBaseline.current === null) tabTitleBaseline.current = document.title;
    document.title = `${title} · Pulse`;
    return () => {
      document.title = tabTitleBaseline.current ?? 'Pulse — calm, fast messaging';
    };
  }, [title]);

  const avatarRaw = chat?.avatarUrl ?? chat?.peer?.avatarUrl ?? null;
  const peerId = chat?.type === 'DIRECT' ? chat?.peer?.id : null;
  const status =
    chat?.type === 'DIRECT' && chat?.peer
      ? directChatPresenceSubtitle(chat.peer, t, language)
      : typeLabel(t as any, chat?.type);
  const statusText = typing && chat?.type === 'DIRECT' ? t('typing') : status;
  const initial = title.slice(0, 1).toUpperCase() || '?';
  const pinned = chat?.pinnedMessage ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0e1621] text-white md:bg-transparent md:text-inherit">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        <header
          className={cn(
            'flex shrink-0 items-center gap-2.5 px-3',
            'sticky top-0 z-20 border-b border-black/25 bg-[#17212b]/95 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_6px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl',
            'md:static md:z-auto md:border-b md:border-line/75 md:bg-surface-elevated/98 md:py-1.5 md:pt-1.5 md:shadow-[0_1px_0_rgba(0,0,0,0.04)] md:backdrop-blur-md dark:md:border-line/45 dark:md:bg-surface-elevated/95 dark:md:shadow-[0_1px_0_rgba(255,255,255,0.04)]',
          )}
        >
          <button
            type="button"
            className={cn(
              'flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full transition md:hidden',
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
              <SafeAvatar
                url={avatarRaw}
                label={initial}
                className={cn(
                  'h-9 w-9 rounded-full ring-1 ring-white/15 transition md:h-10 md:w-10',
                  'md:ring-line/55 md:hover:ring-accent/35 dark:md:ring-line/35',
                )}
                fallbackClassName={cn(
                  'text-xs font-semibold ring-1 ring-line/45 transition hover:ring-accent/35 md:text-sm',
                  'border border-white/12 bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white ring-white/15',
                  'md:border-transparent md:bg-gradient-to-br md:from-accent/30 md:to-accent/10 md:text-accent md:ring-line/45 dark:md:from-accent/25 dark:md:to-accent/5',
                )}
              />
            </Link>
          ) : (
            <div className="relative h-9 w-9 shrink-0 md:h-10 md:w-10">
              <SafeAvatar
                url={avatarRaw}
                label={initial}
                className={cn(
                  'h-9 w-9 rounded-full ring-1 ring-white/15 md:h-10 md:w-10',
                  'md:ring-line/55 dark:md:ring-line/35',
                )}
                fallbackClassName={cn(
                  'text-xs font-semibold ring-1 ring-line/45 md:text-sm',
                  'border border-white/12 bg-gradient-to-br from-sky-400/35 via-blue-500/15 to-emerald-300/10 text-white ring-white/15',
                  'md:border-transparent md:bg-gradient-to-br md:from-accent/30 md:to-accent/10 md:text-accent dark:md:from-accent/25 dark:md:to-accent/5',
                )}
              />
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
              'inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition hover:bg-white/12 active:scale-[0.99]',
              'md:h-9 md:w-9 md:min-h-0 md:min-w-0 md:border-line/75 md:bg-transparent md:text-ink-muted md:hover:border-accent/35 md:hover:bg-surface-muted/55 dark:md:border-line/50',
            )}
            onClick={() => setInChatSearchOpen(true)}
            aria-label={t('chatSearchTitle')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex min-h-[44px] shrink-0 touch-manipulation items-center rounded-full border border-white/12 bg-white/8 px-3.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/75 transition hover:bg-white/12 hover:text-white active:scale-[0.99]',
              'md:h-9 md:min-h-0 md:border-line/75 md:bg-transparent md:text-ink-muted md:hover:border-accent/35 md:hover:bg-surface-muted/55 md:hover:text-ink dark:md:border-line/50 dark:md:hover:bg-surface-elevated/55',
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
        {chatId && (
          <ChatSearchOverlay
            open={inChatSearchOpen}
            onClose={() => setInChatSearchOpen(false)}
            chatId={chatId}
          />
        )}
        {chatId && <MessageThread chatId={chatId} />}
      </div>
    </div>
  );
}
