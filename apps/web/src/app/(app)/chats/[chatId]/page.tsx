'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

// Stable empty reference for zustand selectors: returning a fresh `[]` from a
// selector each render breaks useSyncExternalStore caching and triggers an
// infinite update loop (React #185).
const EMPTY_TYPING_IDS: string[] = [];

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
  const sp = useSearchParams();
  const searchFlag = sp?.get('search');
  const qc = useQueryClient();
  const detailsOpen = useUiStore((s) => s.detailsOpen);
  const setDetailsOpen = useUiStore((s) => s.setDetailsOpen);
  const typingIds = useUiStore((s) => s.typingByChat[chatId]) ?? EMPTY_TYPING_IDS;
  const setTyping = useUiStore((s) => s.setTypingForChat);
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);

  useEffect(() => {
    setDetailsOpen(false);
  }, [chatId, setDetailsOpen]);

  useEffect(() => {
    // Allow deep-linking into in-chat search (used from profile screen).
    if (searchFlag === '1') setInChatSearchOpen(true);
  }, [searchFlag]);

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
      setTyping(chatId, ids);
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
      setTyping(chatId, []);
    };
  }, [chatId, qc, setTyping]);

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
    placeholderData: () => {
      const rows = qc.getQueryData<ChatListItem[]>(['chats']);
      const row = rows?.find((c) => c.id === chatId);
      if (!row) return undefined;
      const p = row.peer;
      return {
        id: row.id,
        type: row.type,
        title: row.title,
        avatarUrl: row.avatarUrl,
        peer: p
          ? {
              id: p.id,
              username: p.username,
              displayName: p.displayName,
              avatarUrl: p.avatarUrl,
              isOnline: p.isOnline,
              lastSeenAt: null,
              lastSeenVisible: true,
            }
          : null,
      } as ChatDetailForDrawer;
    },
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
  const statusText = typingIds.length > 0 ? t('typing') : status;
  const initial = title.slice(0, 1).toUpperCase() || '?';
  const pinned = chat?.pinnedMessage ?? null;

  return (
    <div
      className={cn(
        'flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden chat-thread-bg text-ink dark:text-white',
        'max-md:z-[25]',
        'md:relative md:h-full md:min-h-0 md:flex-1 md:bg-transparent md:text-inherit',
      )}
    >
      <header
        className={cn(
          'flex shrink-0 items-center gap-2.5 px-3',
          'relative z-20 border-b border-line/70 bg-surface-elevated/90 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl',
          'dark:border-white/[0.10] dark:bg-[rgb(var(--tg-panel))]/92',
          'md:static md:z-auto md:py-1.5 md:pt-1.5',
        )}
      >
        <button
          type="button"
          className={cn(
            'flex min-h-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full transition md:hidden',
            'px-3 text-[15px] font-semibold text-accent active:bg-line/25 dark:text-[#58a6ff] dark:active:bg-white/[0.08]',
          )}
          onClick={() => router.push('/chats')}
          aria-label={t('backToChatListAria')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="-ml-1">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="ml-0.5">{t('chats')}</span>
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
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="relative h-9 w-9 shrink-0 md:h-10 md:w-10"
            aria-label={t('info')}
          >
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
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (peerId) {
              router.push(`/users/${peerId}`);
              return;
            }
            setDetailsOpen(true);
          }}
          className="min-w-0 flex-1 py-0.5 text-left"
          aria-label={peerId ? t('openProfileAria') : t('info')}
        >
          <h1
            className={cn(
              'truncate font-display text-[1.02rem] font-semibold leading-tight tracking-tight md:text-[1.0625rem]',
              'text-ink dark:text-white',
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              'mt-0.5 truncate text-[13px] leading-tight',
              'text-ink-muted dark:text-white/55',
            )}
          >
            {statusText}
          </p>
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full text-ink-muted transition active:bg-line/25 dark:text-white/75 dark:active:bg-white/[0.08]',
            'md:h-9 md:w-9 md:min-h-0 md:min-w-0',
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
        {/* Info is opened via avatar/title tap (Telegram iOS-like). */}
      </header>
      {pinned && (
        <button
          type="button"
          onClick={() => router.push(`/chats/${chatId}?highlight=${pinned.id}`)}
          className={cn(
            'flex shrink-0 items-center gap-2 px-3 py-2 text-left text-sm',
            'border-b border-line/60 bg-surface-elevated/70 text-ink-muted hover:bg-surface-muted/60',
            'dark:border-white/[0.10] dark:bg-[rgb(var(--tg-panel))]/65 dark:text-white/70 dark:hover:bg-white/[0.06]',
          )}
          aria-label={t('pinnedMessageAria')}
        >
          <span className="inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            {t('pinnedBadge')}
          </span>
          <span className={cn('min-w-0 flex-1 truncate text-[13px]', 'text-ink dark:text-white')}>
            {pinned.deletedAt
              ? t('messageDeleted')
              : pinned.text?.trim()
                ? pinned.text
                : t('attachment')}
          </span>
          <span className={cn('shrink-0 text-[11px] font-semibold', 'text-sky-300 md:text-accent')}>
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
  );
}
