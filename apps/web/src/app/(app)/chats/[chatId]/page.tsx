'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
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
  const setSidebar = useUiStore((s) => s.setSidebarOpen);
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
    chat?.title ?? chat?.peer?.displayName ?? chat?.peer?.username ?? 'Conversation';

  const avatarSrc = chat?.avatarUrl ?? chat?.peer?.avatarUrl ?? null;
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
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-line/75 bg-surface-elevated/98 px-3 py-1.5 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-line/45 dark:bg-surface-elevated/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/75 text-ink-muted transition hover:bg-surface-muted/90 hover:text-ink md:hidden dark:border-line/50 dark:hover:bg-surface-muted/45"
          onClick={() => setSidebar(true)}
          aria-label="Back to chat list"
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
            aria-label="Open profile"
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarSrc}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-1 ring-line/55 transition hover:ring-accent/35 dark:ring-line/35 md:h-10 md:w-10"
              />
            ) : (
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 transition hover:ring-accent/35 md:h-10 md:w-10 md:text-sm',
                  'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
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
                className="h-9 w-9 rounded-full object-cover ring-1 ring-line/55 dark:ring-line/35 md:h-10 md:w-10"
              />
            ) : (
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-1 ring-line/45 md:h-10 md:w-10 md:text-sm',
                  'bg-gradient-to-br from-accent/30 to-accent/10 text-accent dark:from-accent/25 dark:to-accent/5',
                )}
              >
                {initial}
              </div>
            )}
          </div>
        )}
        <div className="min-w-0 flex-1 py-0.5">
          <h1 className="truncate font-display text-[0.98rem] font-semibold leading-tight tracking-tight text-ink md:text-[1.0625rem]">
            {title}
          </h1>
          <p className="mt-0.5 truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-muted/85">
            {statusText}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center rounded-full border border-line/75 px-3 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted transition hover:border-accent/35 hover:bg-surface-muted/55 hover:text-ink dark:border-line/50 dark:hover:bg-surface-elevated/55"
          onClick={() => setDetailsOpen(true)}
        >
          Info
        </button>
      </header>
      {pinned && (
        <button
          type="button"
          onClick={() => router.push(`/chats/${chatId}?highlight=${pinned.id}`)}
          className="flex shrink-0 items-center gap-2 border-b border-line/60 bg-surface-elevated/90 px-3 py-2 text-left text-sm text-ink-muted hover:bg-surface-muted/60 dark:border-line/45 dark:bg-surface-elevated/95"
          aria-label="Pinned message"
        >
          <span className="inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">
            Pinned
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
            {pinned.deletedAt ? 'Message deleted' : pinned.text?.trim() ? pinned.text : 'Attachment'}
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-accent">View</span>
        </button>
      )}
      <ChatDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        chat={chat}
      />
      {chatId && <MessageThread chatId={chatId} />}
    </div>
  );
}
