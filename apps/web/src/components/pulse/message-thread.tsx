'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { bumpChatListPreview } from '@/lib/chat-query-helpers';
import { applyOptimisticReaction } from '@/lib/reaction-optimistic';
import type { ChatListItem, MessageDto, MeUserDto } from '@/lib/types';
import { connectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/cn';
import { decodeJwtSub } from '@/lib/jwt';
import { uploadMedia } from '@/lib/upload-media';
import { usePendingAttachmentsStore } from '@/stores/pending-attachments-store';
import { Composer } from './composer';
import { MessageActionsMenu } from './message-actions-menu';
import { motion } from 'framer-motion';

/** Messages from the same sender within this window visually stack as one group. */
const GROUP_GAP_MS = 5 * 60 * 1000;

function SingleCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 13l3 3L21 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13l3 3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
}

function sameCalendarDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDateDivider(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function inSameGroup(prev: MessageDto, curr: MessageDto): boolean {
  if (prev.type === 'SYSTEM' || curr.type === 'SYSTEM') return false;
  if (prev.senderId !== curr.senderId) return false;
  const t1 = new Date(prev.createdAt).getTime();
  const t2 = new Date(curr.createdAt).getTime();
  return Math.abs(t2 - t1) < GROUP_GAP_MS;
}

type MessagesQueryData = { items: MessageDto[]; nextCursor: string | null };

export function MessageThread({ chatId }: { chatId: string }) {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const myIdFromToken = decodeJwtSub(accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);
  const addPending = usePendingAttachmentsStore((s) => s.add);
  const parentRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [dragActive, setDragActive] = useState(false);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const [editing, setEditing] = useState<MessageDto | null>(null);
  const [forwarding, setForwarding] = useState<MessageDto | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const params = useSearchParams();
  const highlightId = params.get('highlight');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const { data: meUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });
  const myId = myIdFromToken ?? meUser?.id ?? null;

  const { data: chatsForForward } = useQuery<ChatListItem[]>({
    queryKey: ['chats', ''],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: Boolean(forwarding),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () =>
      apiFetch<{ items: MessageDto[]; nextCursor: string | null }>(
        `/chats/${chatId}/messages?take=80`,
      ),
  });

  const messages = data?.items ?? [];
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    return () => {
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    };
  }, []);

  const cancelHoverLeaveTimer = () => {
    if (hoverLeaveTimer.current) {
      clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  };

  const onMessageRowEnter = (id: string) => {
    cancelHoverLeaveTimer();
    // kept for backwards compatibility with hover styles; menu interaction is click-based now.
  };

  const onMessageRowLeave = () => {
    cancelHoverLeaveTimer();
    hoverLeaveTimer.current = setTimeout(() => {
      hoverLeaveTimer.current = null;
    }, 220);
  };

  useEffect(() => {
    if (!accessToken) return;
    const s = connectSocket();

    const joinRoom = () => {
      s.emit('chat:join', { chatId });
    };
    if (s.connected) joinRoom();
    s.on('connect', joinRoom);

    const patchMessages = (fn: (old: MessagesQueryData | undefined) => MessagesQueryData | undefined) => {
      qc.setQueryData<MessagesQueryData>(['messages', chatId], fn);
    };

    const onMessageNew = (payload: unknown) => {
      if (!payload || typeof payload !== 'object' || !('id' in payload)) {
        void qc.invalidateQueries({ queryKey: ['messages', chatId] });
        return;
      }
      const msg = payload as MessageDto;
      patchMessages((old) => {
        if (!old) return { items: [msg], nextCursor: null };
        if (old.items.some((m) => m.id === msg.id)) {
          return { ...old, items: old.items.map((m) => (m.id === msg.id ? msg : m)) };
        }
        const withoutMatchingOptimistic = old.items.filter((m) => {
          if (!m.id.startsWith('optimistic:')) return true;
          if (msg.clientTempId && m.clientTempId === msg.clientTempId) return false;
          return !(
            m.senderId === msg.senderId &&
            (m.text ?? '') === (msg.text ?? '') &&
            Math.abs(new Date(msg.createdAt).getTime() - new Date(m.createdAt).getTime()) < 120_000
          );
        });
        return { ...old, items: [...withoutMatchingOptimistic, msg] };
      });
      const preview = msg.text?.trim() ? msg.text.slice(0, 160) : '[Media]';
      bumpChatListPreview(qc, chatId, preview, msg.createdAt);
    };

    const onMessageUpdated = (payload: unknown) => {
      if (!payload || typeof payload !== 'object' || !('id' in payload)) {
        void qc.invalidateQueries({ queryKey: ['messages', chatId] });
        return;
      }
      const msg = payload as MessageDto;
      patchMessages((old) => {
        if (!old) return old;
        return { ...old, items: old.items.map((m) => (m.id === msg.id ? msg : m)) };
      });
    };

    const onReactionUpdate = (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const p = payload as { messageId?: string; reactions?: MessageDto['reactions'] };
      if (!p.messageId || !p.reactions) return;
      patchMessages((old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((m) =>
            m.id === p.messageId ? { ...m, reactions: p.reactions! } : m,
          ),
        };
      });
    };

    const onDeliveredUpdate = (payload: unknown) => {
      const p = payload as { chatId?: string; userId?: string; messageId?: string };
      if (!p?.chatId || p.chatId !== chatId || !p.messageId || !p.userId) return;
      // If someone else delivered up to messageId, my outgoing messages up to that point are DELIVERED.
      const myId = meUser?.id;
      if (!myId) return;
      if (p.userId === myId) return;
      patchMessages((old) => {
        if (!old) return old;
        const pivot = old.items.find((x) => x.id === p.messageId);
        if (!pivot) return old;
        const pivotTs = new Date(pivot.createdAt).getTime();
        return {
          ...old,
          items: old.items.map((x) => {
            if (x.senderId !== myId) return x;
            if (x.deliveryStatus === 'READ') return x;
            if (new Date(x.createdAt).getTime() <= pivotTs) return { ...x, deliveryStatus: 'DELIVERED' };
            return x;
          }),
        };
      });
    };

    const onReadUpdate = (payload: unknown) => {
      const p = payload as { chatId?: string; userId?: string; messageId?: string };
      if (!p?.chatId || p.chatId !== chatId || !p.messageId || !p.userId) return;
      const myId = meUser?.id;
      if (!myId) return;
      if (p.userId === myId) return;
      patchMessages((old) => {
        if (!old) return old;
        const pivot = old.items.find((x) => x.id === p.messageId);
        if (!pivot) return old;
        const pivotTs = new Date(pivot.createdAt).getTime();
        return {
          ...old,
          items: old.items.map((x) => {
            if (x.senderId !== myId) return x;
            if (new Date(x.createdAt).getTime() <= pivotTs) return { ...x, deliveryStatus: 'READ' };
            return x;
          }),
        };
      });
    };

    s.on('message:new', onMessageNew);
    s.on('message:updated', onMessageUpdated);
    s.on('reaction:update', onReactionUpdate);
    s.on('message:deliveredUpdate', onDeliveredUpdate);
    s.on('message:readUpdate', onReadUpdate);
    return () => {
      s.off('connect', joinRoom);
      s.emit('chat:leave', { chatId });
      s.off('message:new', onMessageNew);
      s.off('message:updated', onMessageUpdated);
      s.off('reaction:update', onReactionUpdate);
      s.off('message:deliveredUpdate', onDeliveredUpdate);
      s.off('message:readUpdate', onReadUpdate);
    };
  }, [accessToken, chatId, myId, qc]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 82,
    overscan: 14,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!highlightId || messages.length === 0) return;
    const idx = messages.findIndex((m) => m.id === highlightId);
    if (idx < 0) return;
    virtualizer.scrollToIndex(idx, { align: 'center' });
    setHighlighted(highlightId);
    const t = window.setTimeout(() => setHighlighted(null), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, messages.length]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el || messages.length === 0) return;
    el.scrollTop = el.scrollHeight;
  }, [chatId, messages.length]);

  useEffect(() => {
    // Switching chats should reset transient composer modes.
    setReplyTo(null);
    setEditing(null);
    setForwarding(null);
    setMenuFor(null);
  }, [chatId]);

  const doForwardTo = async (targetChatId: string) => {
    const src = forwarding;
    if (!src) return;
    if (src.deletedAt) return;
    // MVP: forward only text messages (attachments forwarding can come later).
    if (!src.text?.trim()) {
      window.alert('This message type cannot be forwarded yet (MVP: text only).');
      return;
    }
    try {
      const created = await apiFetch<MessageDto>(`/chats/${targetChatId}/messages`, {
        method: 'POST',
        body: {
          text: src.text,
          forwardedFromMessageId: src.id,
        },
      });
      bumpChatListPreview(
        qc,
        targetChatId,
        created.text?.trim() ? created.text.slice(0, 160) : '[Forwarded]',
        created.createdAt,
      );
      setForwarding(null);
    } catch {
      window.alert('Failed to forward message.');
    }
  };

  useEffect(() => {
    // If the thread scrolls, close the menu (anchored positioning becomes stale).
    const el = parentRef.current;
    if (!el) return;
    const onScroll = () => setMenuFor(null);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const markRead = async (last: MessageDto) => {
    const s = getSocket();
    try {
      await apiFetch(`/chats/${chatId}/messages/${last.id}/read`, { method: 'POST' });
      s?.emit('message:read', { chatId, messageId: last.id });
    } catch {
      /* ignore */
    }
  };

  const markDelivered = async (last: MessageDto) => {
    try {
      await apiFetch(`/chats/${chatId}/messages/${last.id}/delivered`, { method: 'POST' });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    void markDelivered(last);
    void markRead(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, lastId]);

  // If we don't know who "me" is yet, don't mis-render everything as incoming.
  // Wait until auth storage has hydrated, and we have either token-sub or /me.
  if (hasHydrated && !myId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-sm text-ink-muted">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={parentRef}
        className="scrollbar-thin chat-thread-bg relative isolate min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-1.5 md:px-5 md:py-2.5"
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragDepth.current += 1;
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!dragActive) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragActive(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          dragDepth.current = 0;
          setDragActive(false);
          const files = Array.from(e.dataTransfer.files ?? []);
          if (!files.length) return;
          if (!accessToken) return;
          for (const f of files) {
            const kind = f.type.startsWith('image/')
              ? 'image'
              : f.type.startsWith('video/')
                ? 'video'
                : 'file';
            try {
              const meta = await uploadMedia(f, kind, accessToken, sessionId);
              addPending(chatId, {
                localId: `pending:${Date.now()}-${Math.random().toString(16).slice(2)}`,
                storageKey: meta.storageKey,
                url: meta.url,
                fileName: meta.fileName,
                mimeType: meta.mimeType,
                sizeBytes: meta.sizeBytes,
                kind,
                createdAt: Date.now(),
              });
            } catch {
              // ignore failed file; user can retry by dropping again
            }
          }
        }}
      >
        {dragActive && (
          <div className="pointer-events-none absolute inset-0 z-[50] flex items-center justify-center">
            <div className="rounded-2xl border border-line/70 bg-surface-elevated/85 px-4 py-3 text-sm font-semibold text-ink shadow-lg backdrop-blur dark:border-line/45 dark:bg-surface-elevated/65">
              Drop files to upload
            </div>
          </div>
        )}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-12 animate-pulse rounded-[1.125rem]',
                  i % 2 === 0 ? 'ml-auto w-[70%] bg-bubble-out/18' : 'mr-auto w-[66%] bg-bubble-in/45',
                )}
              />
            ))}
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line/60 bg-surface-elevated/90 shadow-sm backdrop-blur">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M8 10h8M8 14h5M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
                  stroke="currentColor"
                  className="text-ink-muted"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-4 font-display text-xl font-semibold text-ink">Quiet here</p>
            <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">
              Send the first message to start the conversation.
            </p>
          </div>
        )}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
            width: '100%',
          }}
        >
          {items.map((vi) => {
            const m = messages[vi.index];
            if (!m) return null;
            const prev = vi.index > 0 ? messages[vi.index - 1] : undefined;
            const next = vi.index < messages.length - 1 ? messages[vi.index + 1] : undefined;
            const rowActive = menuFor === m.id;
            return (
              <div
                key={m.id}
                ref={virtualizer.measureElement}
                data-index={vi.index}
                className={cn('absolute left-0 top-0 w-full', rowActive ? 'z-[30]' : 'z-[1]')}
                style={{ transform: `translateY(${vi.start}px)` }}
              >
                <MessageBubble
                  m={m}
                  prev={prev}
                  next={next}
                  myId={myId ?? undefined}
                    highlighted={highlighted === m.id}
                  onReply={() => setReplyTo(m)}
                  onForward={() => setForwarding(m)}
                    onEdit={() => {
                      setReplyTo(null);
                      setEditing(m);
                    }}
                    onDelete={() => {
                      setReplyTo(null);
                      setEditing(null);
                    }}
                  menuOpen={menuFor === m.id}
                  setMenuOpen={(open) => setMenuFor(open ? m.id : null)}
                  chatId={chatId}
                  onMessageRowEnter={onMessageRowEnter}
                  onMessageRowLeave={onMessageRowLeave}
                  closeOnScrollEl={parentRef}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Composer
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
      />
      {forwarding && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center"
          role="dialog"
          aria-label="Forward message"
          onMouseDown={() => setForwarding(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift dark:border-line/55 dark:bg-surface-elevated/98"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2.5 dark:border-line/45">
              <div className="font-display text-[0.95rem] font-semibold text-ink">Forward to…</div>
              <button
                type="button"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-surface-muted/35"
                onClick={() => setForwarding(null)}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-1.5">
              {(chatsForForward ?? []).map((c) => {
                const label = c.title ?? c.peer?.displayName ?? c.peer?.username ?? 'Chat';
                const preview = c.lastMessagePreview?.trim() ?? '';
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-muted/80 dark:hover:bg-surface-muted/35"
                    onClick={() => void doForwardTo(c.id)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 text-xs font-semibold text-accent ring-1 ring-line/45 dark:from-accent/25 dark:to-accent/5 dark:ring-line/35">
                      {(label.slice(0, 1).toUpperCase() || '?') as string}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold text-ink">{label}</div>
                      <div className="truncate text-[11.5px] text-ink-muted">{preview || ' '}</div>
                    </div>
                  </button>
                );
              })}
              {(chatsForForward ?? []).length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-ink-muted">No chats found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  m,
  prev,
  next,
  myId,
  highlighted,
  onReply,
  onForward,
  onEdit,
  onDelete,
  menuOpen,
  setMenuOpen,
  chatId,
  onMessageRowEnter,
  onMessageRowLeave,
  closeOnScrollEl,
}: {
  m: MessageDto;
  prev?: MessageDto;
  next?: MessageDto;
  myId?: string;
  highlighted: boolean;
  onReply: () => void;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  chatId: string;
  onMessageRowEnter: (id: string) => void;
  onMessageRowLeave: () => void;
  closeOnScrollEl: React.RefObject<HTMLDivElement | null>;
}) {
  const qc = useQueryClient();
  const isDeleted = Boolean(m.deletedAt);
  const isSystem = m.type === 'SYSTEM';
  const showTrigger = menuOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isNew = useMemo(() => Date.now() - new Date(m.createdAt).getTime() < 2500, [m.createdAt]);

  const linkify = (t: string) => {
    const parts = t.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((p, i) =>
      /^https?:\/\//.test(p) ? (
        <a
          key={i}
          href={p}
          className="break-all underline decoration-current/40 underline-offset-2 hover:decoration-current"
          target="_blank"
          rel="noreferrer"
        >
          {p}
        </a>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  const patchMessageReactions = (id: string, reactions: MessageDto['reactions']) => {
    qc.setQueryData<MessagesQueryData>(['messages', chatId], (old: MessagesQueryData | undefined) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((m: MessageDto) => (m.id === id ? { ...m, reactions } : m)),
      };
    });
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const uid = myId ?? qc.getQueryData<{ id: string }>(['me'])?.id;
    if (!uid) return;
    const current = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
    const msg = current?.items?.find((x: MessageDto) => x.id === messageId);
    if (!msg) return;
    const r = msg.reactions.find((x: MessageDto['reactions'][number]) => x.emoji === emoji);
    const hasMine = Boolean(r?.userIds.includes(uid));
    const snapshot = msg.reactions.map((x: MessageDto['reactions'][number]) => ({
      emoji: x.emoji,
      count: x.count,
      userIds: [...x.userIds],
    }));
    const optimistic = applyOptimisticReaction(msg.reactions, emoji, uid, !hasMine);
    patchMessageReactions(messageId, optimistic);
    try {
      let reactions: MessageDto['reactions'];
      if (hasMine) {
        reactions = await apiFetch<MessageDto['reactions']>(
          `/chats/${chatId}/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`,
          { method: 'DELETE' },
        );
      } else {
        reactions = await apiFetch<MessageDto['reactions']>(
          `/chats/${chatId}/messages/${messageId}/reactions`,
          {
            method: 'POST',
            body: { emoji },
          },
        );
      }
      patchMessageReactions(messageId, reactions);
    } catch {
      patchMessageReactions(messageId, snapshot);
    }
  };

  const softDelete = async () => {
    const isOutgoing = Boolean(myId && m.senderId === myId);
    const canDelete = isOutgoing && !isDeleted;
    if (!canDelete) return;
    const ok = window.confirm('Delete this message?');
    if (!ok) return;
    onDelete();
    setMenuOpen(false);

    const snapshot = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
    qc.setQueryData<MessagesQueryData>(['messages', chatId], (old) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((x) =>
          x.id === m.id ? { ...x, deletedAt: new Date().toISOString(), text: null } : x,
        ),
      };
    });

    try {
      const updated = await apiFetch<MessageDto>(`/chats/${chatId}/messages/${m.id}`, {
        method: 'DELETE',
      });
      qc.setQueryData<MessagesQueryData>(['messages', chatId], (old) => {
        if (!old) return old;
        return { ...old, items: old.items.map((x) => (x.id === updated.id ? updated : x)) };
      });
      bumpChatListPreview(qc, chatId, 'Message deleted', updated.createdAt);
    } catch {
      qc.setQueryData(['messages', chatId], snapshot);
    }
  };

  const pinOrUnpin = async (messageId: string | null) => {
    try {
      const currentPinned = (qc.getQueryData(['chat', chatId]) as any)?.pinnedMessage?.id ?? null;
      const nextId = messageId && currentPinned === messageId ? null : messageId;
      const res = await apiFetch<{ ok: boolean; pinnedMessageId: string | null }>(`/chats/${chatId}/pin-message`, {
        method: 'POST',
        body: { messageId: nextId },
      });
      qc.setQueryData(['chat', chatId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pinnedMessage: res.pinnedMessageId
            ? {
                id: m.id,
                text: m.text,
                senderId: m.senderId ?? null,
                createdAt: m.createdAt,
                deletedAt: m.deletedAt ?? null,
                sender: null,
              }
            : null,
        };
      });
    } catch (e) {
      // Surface errors: pin needs the migration + endpoint working.
      // eslint-disable-next-line no-console
      console.error('[pin-message] failed', e);
      window.alert('Failed to pin message. Check server logs / migration.');
    }
  };

  if (isSystem) {
    return (
      <div className="mb-1.5 mt-2 flex justify-center first:mt-0">
        <span className="rounded-full bg-surface-muted/95 px-2.5 py-0.5 text-[0.65rem] font-semibold text-ink-muted shadow-sm ring-1 ring-line/35 dark:bg-surface-elevated/90 dark:ring-line/40 dark:text-ink-muted/90">
          {m.text}
        </span>
      </div>
    );
  }

  const isOutgoing = Boolean(myId && m.senderId === myId);
  const canEdit = isOutgoing && !isDeleted && m.type === 'TEXT';
  const canDelete = isOutgoing && !isDeleted;
  const canCopy = Boolean(m.text && !isDeleted);
  const showDate = !prev || !sameCalendarDay(prev.createdAt, m.createdAt);
  const firstInGroup = !prev || prev.type === 'SYSTEM' || !inSameGroup(prev, m);
  const lastInGroup = !next || next.type === 'SYSTEM' || !inSameGroup(m, next);

  const actions = useMemo(
    () => [
      {
        id: 'reply',
        label: 'Reply',
        onSelect: onReply,
      },
      {
        id: 'forward',
        label: 'Forward',
        disabled: isDeleted || !m.text?.trim(),
        onSelect: () => {
          setMenuOpen(false);
          onForward();
        },
      },
      {
        id: 'pin',
        label: ((qc.getQueryData(['chat', chatId]) as any)?.pinnedMessage?.id ?? null) === m.id ? 'Unpin message' : 'Pin message',
        disabled: isDeleted,
        onSelect: () => pinOrUnpin(m.id),
      },
      {
        id: 'copy',
        label: 'Copy text',
        disabled: !canCopy,
        onSelect: async () => {
          const t = m.text ?? '';
          try {
            await navigator.clipboard.writeText(t);
          } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = t;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
        },
      },
      {
        id: 'edit',
        label: 'Edit',
        disabled: !canEdit,
        onSelect: () => {
          setMenuOpen(false);
          onEdit();
        },
      },
      {
        id: 'delete',
        label: 'Delete message',
        danger: true,
        disabled: !canDelete,
        onSelect: softDelete,
      },
    ],
    [canCopy, canDelete, canEdit, isDeleted, m.id, m.text, onEdit, onForward, onReply, setMenuOpen],
  );

  // Premium-ish grouping: inner corners get flatter so stacks read as one unit.
  const bubbleRadius = cn(
    'rounded-[1.25rem]',
    // middle/top join
    !firstInGroup && isOutgoing && 'rounded-tr-[0.55rem]',
    !firstInGroup && !isOutgoing && 'rounded-tl-[0.55rem]',
    // middle/bottom join
    !lastInGroup && isOutgoing && 'rounded-br-[0.55rem]',
    !lastInGroup && !isOutgoing && 'rounded-bl-[0.55rem]',
  );

  const rowTopSpace = showDate
    ? firstInGroup
      ? 'mt-5'
      : 'mt-3'
    : firstInGroup
      ? 'mt-3'
      : 'mt-[3px]';

  return (
    <motion.div
      layout="position"
      initial={isNew ? { opacity: 0, y: 6, scale: 0.992 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
      className={rowTopSpace}
    >
      {showDate && (
        <div className="mb-2 flex justify-center">
          <span className="rounded-full bg-surface-elevated/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-muted/90 shadow-sm ring-1 ring-line/35 backdrop-blur dark:bg-surface-elevated/85 dark:ring-line/40">
            {formatDateDivider(m.createdAt)}
          </span>
        </div>
      )}
      <div className={cn('flex w-full', isOutgoing ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'group relative max-w-[min(100%,34rem)] pt-8 -mt-8',
            isOutgoing ? 'ml-auto' : 'mr-auto',
          )}
          onMouseEnter={() => onMessageRowEnter(m.id)}
          onMouseLeave={onMessageRowLeave}
        >
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              'absolute top-1 z-[45] flex h-7 w-7 items-center justify-center rounded-full border border-line/80 bg-surface-elevated text-ink-muted shadow-sm transition',
              'hover:bg-surface-muted hover:text-ink dark:border-line/55 dark:bg-surface-muted/35',
              isOutgoing ? 'right-0' : 'left-0',
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Message actions"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h.01M12 12h.01M19 12h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <MessageActionsMenu
            open={menuOpen}
            anchorRef={triggerRef}
            onClose={() => setMenuOpen(false)}
            actions={actions}
            showReactions={!isDeleted}
            onReact={(emoji) => toggleReaction(m.id, emoji)}
            closeOnScrollEl={closeOnScrollEl}
          />
          <div
            className={cn(
              'relative z-[1] px-[0.7rem] py-[0.45rem] text-[13.5px] leading-[1.42]',
              bubbleRadius,
              isOutgoing
                ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/[0.07] ring-1 ring-black/[0.06] dark:shadow-lg dark:shadow-black/40 dark:ring-white/10'
                : 'bg-bubble-in/98 text-ink shadow-sm ring-1 ring-line/45 dark:bg-bubble-in dark:text-ink/95 dark:ring-line/40 dark:shadow-black/20',
              highlighted && 'ring-2 ring-accent/55',
              isDeleted && 'opacity-75',
            )}
            onDoubleClick={() => {
              if (isSystem || isDeleted) return;
              void toggleReaction(m.id, '❤️');
            }}
          >
          {m.replyTo && (
            <div
              className={cn(
                'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                isOutgoing ? 'border-bubble-out-ink/45' : 'border-accent/55 dark:border-accent/45',
              )}
            >
              {m.replyTo.deletedAt ? 'Original message removed' : m.replyTo.text}
            </div>
          )}
          {m.forwardedFromMessageId && (
            <div
              className={cn(
                'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                isOutgoing ? 'border-bubble-out-ink/45' : 'border-accent/55 dark:border-accent/45',
              )}
            >
              <span className="font-bold uppercase tracking-[0.1em]">Forwarded</span>{' '}
              {m.forwardedFromUser ? (
                <span className="opacity-90">
                  from {m.forwardedFromUser.displayName ?? m.forwardedFromUser.username}
                </span>
              ) : null}
            </div>
          )}
          <p className={cn('whitespace-pre-wrap break-words', isDeleted && 'italic opacity-75')}>
            {isDeleted ? 'Message deleted' : m.text ? linkify(m.text) : null}
          </p>
          {m.attachments?.length > 0 && (
            <div className="mt-2 space-y-2">
              {m.attachments.map((a) =>
                a.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={a.id}
                    src={a.url}
                    alt={a.fileName}
                    className="max-h-56 w-full rounded-xl object-cover"
                  />
                ) : (
                  <a
                    key={a.id}
                    href={a.url}
                    className={cn(
                      'block rounded-xl px-3 py-2 text-2xs font-medium underline-offset-2 hover:underline',
                      isOutgoing ? 'bg-black/10 text-bubble-out-ink' : 'bg-black/5 text-accent dark:bg-black/20',
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.fileName}
                  </a>
                ),
              )}
            </div>
          )}
          <div
            className={cn(
              'mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0 text-[0.625rem] tabular-nums',
              isOutgoing ? 'justify-end text-bubble-out-ink/70' : 'text-ink-muted',
            )}
          >
            <span>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {m.editedAt && <span className="opacity-75">edited</span>}
            {isOutgoing && lastInGroup && m.deliveryStatus && (
              <span className="ml-0.5 inline-flex items-center gap-0.5 opacity-80" aria-label={m.deliveryStatus}>
                {m.deliveryStatus === 'SENDING' ? (
                  <span className="text-[9px] font-bold uppercase tracking-[0.06em]">…</span>
                ) : m.deliveryStatus === 'SENT' ? (
                  <SingleCheckIcon className="h-3 w-3" />
                ) : (
                  <DoubleCheckIcon className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
          {m.reactions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-0.5">
              {m.reactions.map((r, ri) => (
                <button
                  type="button"
                  key={`${m.id}-${r.emoji}-${ri}`}
                  className={cn(
                    'rounded-full border px-1.5 py-px text-[0.65rem] transition',
                    isOutgoing
                      ? 'border-white/30 bg-black/12 hover:bg-black/18'
                      : 'border-line/55 bg-surface-elevated/50 hover:bg-surface-elevated/80 dark:border-line/45',
                  )}
                  onClick={() => toggleReaction(m.id, r.emoji)}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
