'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { apiFetch } from '@/lib/api';
import type { MessageDto } from '@/lib/types';
import { getSocket, reconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/cn';
import { Composer } from './composer';
import { motion, AnimatePresence } from 'framer-motion';

const GROUP_GAP_MS = 7 * 60 * 1000;

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

export function MessageThread({ chatId }: { chatId: string }) {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.accessToken);
  const parentRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const { data: meUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<{ id: string }>('/users/me'),
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
    if (!me) return;
    const s = reconnectSocket();
    s.emit('chat:join', { chatId });
    const onNew = () => {
      void qc.invalidateQueries({ queryKey: ['messages', chatId] });
      void qc.invalidateQueries({ queryKey: ['chats'] });
    };
    s.on('message:new', onNew);
    s.on('message:updated', onNew);
    s.on('message:deleted', onNew);
    s.on('reaction:update', onNew);
    return () => {
      s.emit('chat:leave', { chatId });
      s.off('message:new', onNew);
      s.off('message:updated', onNew);
      s.off('message:deleted', onNew);
      s.off('reaction:update', onNew);
    };
  }, [chatId, me, qc]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 92,
    overscan: 14,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    const el = parentRef.current;
    if (!el || messages.length === 0) return;
    el.scrollTop = el.scrollHeight;
  }, [chatId, messages.length]);

  const markRead = async (last: MessageDto) => {
    const s = getSocket();
    try {
      await apiFetch(`/chats/${chatId}/messages/${last.id}/read`, { method: 'POST' });
      s?.emit('message:read', { chatId, messageId: last.id });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last) void markRead(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, lastId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={parentRef}
        className="scrollbar-thin chat-thread-bg min-h-0 flex-1 overflow-y-auto px-3 py-2 md:px-4 md:py-3"
      >
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-14 animate-pulse rounded-2xl',
                  i % 2 === 0 ? 'ml-auto w-[72%] bg-bubble-out/20' : 'mr-auto w-[68%] bg-bubble-in/50',
                )}
              />
            ))}
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold text-ink">No messages yet</p>
            <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              Send a message to start the conversation.
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
            return (
              <div
                key={m.id}
                ref={virtualizer.measureElement}
                data-index={vi.index}
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${vi.start}px)` }}
              >
                <MessageBubble
                  m={m}
                  prev={prev}
                  next={next}
                  myId={meUser?.id}
                  onReply={() => setReplyTo(m)}
                  pickerFor={pickerFor}
                  setPickerFor={setPickerFor}
                  chatId={chatId}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Composer chatId={chatId} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  );
}

const EMOJIS = ['👍', '❤️', '😂', '🎉', '👀'];

function MessageBubble({
  m,
  prev,
  next,
  myId,
  onReply,
  pickerFor,
  setPickerFor,
  chatId,
}: {
  m: MessageDto;
  prev?: MessageDto;
  next?: MessageDto;
  myId?: string;
  onReply: () => void;
  pickerFor: string | null;
  setPickerFor: (id: string | null) => void;
  chatId: string;
}) {
  const qc = useQueryClient();
  const isDeleted = Boolean(m.deletedAt);
  const isSystem = m.type === 'SYSTEM';

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

  const toggleReaction = async (emoji: string) => {
    const r = m.reactions.find((x) => x.emoji === emoji);
    const hasMine = myId && r?.userIds.includes(myId);
    if (hasMine) {
      await apiFetch(
        `/chats/${chatId}/messages/${m.id}/reactions?emoji=${encodeURIComponent(emoji)}`,
        { method: 'DELETE' },
      );
    } else {
      await apiFetch(`/chats/${chatId}/messages/${m.id}/reactions`, {
        method: 'POST',
        body: { emoji },
      });
    }
    await qc.invalidateQueries({ queryKey: ['messages', chatId] });
    setPickerFor(null);
  };

  if (isSystem) {
    return (
      <div className="mb-2 mt-3 flex justify-center first:mt-0">
        <span className="rounded-full bg-surface-muted/90 px-3 py-1 text-2xs font-medium text-ink-muted shadow-sm dark:bg-surface-elevated/90 dark:text-ink-muted/90">
          {m.text}
        </span>
      </div>
    );
  }

  const isOutgoing = Boolean(myId && m.senderId === myId);
  const showDate = !prev || !sameCalendarDay(prev.createdAt, m.createdAt);
  const firstInGroup = !prev || prev.type === 'SYSTEM' || !inSameGroup(prev, m);
  const lastInGroup = !next || next.type === 'SYSTEM' || !inSameGroup(m, next);

  const bubbleRadius = cn(
    'rounded-[1.05rem]',
    !firstInGroup && isOutgoing && 'rounded-tr-md',
    !firstInGroup && !isOutgoing && 'rounded-tl-md',
  );

  return (
    <div className={cn(firstInGroup ? 'mt-3' : 'mt-0.5', showDate && firstInGroup && 'mt-2')}>
      {showDate && (
        <div className="mb-2 flex justify-center">
          <span className="rounded-full bg-surface-muted/80 px-3 py-0.5 text-2xs font-semibold uppercase tracking-wider text-ink-muted dark:bg-surface-elevated/80">
            {formatDateDivider(m.createdAt)}
          </span>
        </div>
      )}
      <motion.div
        layout
        className={cn('group relative flex w-full', isOutgoing ? 'justify-end' : 'justify-start')}
      >
        <div
          className={cn(
            'relative max-w-[min(100%,520px)] px-3 py-2 text-[14px] leading-[1.38] shadow-bubble dark:shadow-bubble-dark',
            bubbleRadius,
            isOutgoing
              ? 'bg-bubble-out text-bubble-out-ink'
              : 'bg-bubble-in text-ink dark:text-ink/95',
            isDeleted && 'opacity-80',
          )}
        >
          {m.replyTo && (
            <div
              className={cn(
                'mb-1.5 border-l-[3px] pl-2 text-2xs opacity-90',
                isOutgoing ? 'border-white/50' : 'border-accent/60 dark:border-accent/50',
              )}
            >
              {m.replyTo.deletedAt ? 'Original message removed' : m.replyTo.text}
            </div>
          )}
          <p className={cn('whitespace-pre-wrap break-words', isDeleted && 'italic opacity-75')}>
            {isDeleted ? 'Message removed' : m.text ? linkify(m.text) : null}
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
              'mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-2xs tabular-nums',
              isOutgoing ? 'text-bubble-out-ink/75' : 'text-ink-muted',
            )}
          >
            <span>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {m.editedAt && <span className="opacity-80">edited</span>}
            {isOutgoing && lastInGroup && m.deliveryStatus && (
              <span className="ml-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {m.deliveryStatus === 'READ' ? '✓✓' : m.deliveryStatus === 'DELIVERED' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
          {m.reactions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {m.reactions.map((r) => (
                <button
                  type="button"
                  key={r.emoji}
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-2xs transition',
                    isOutgoing
                      ? 'border-white/25 bg-black/10 hover:bg-black/15'
                      : 'border-line/60 bg-surface-elevated/40 hover:bg-surface-elevated/70 dark:border-line/50',
                  )}
                  onClick={() => toggleReaction(r.emoji)}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
            </div>
          )}
          <div
            className={cn(
              'pointer-events-none absolute -top-8 flex gap-1 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100',
              isOutgoing ? 'right-0 flex-row-reverse' : 'left-0',
            )}
          >
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-line/90 bg-surface-elevated px-2 py-0.5 text-2xs font-medium text-ink shadow-sm dark:border-line/60 dark:bg-surface-muted"
              onClick={onReply}
            >
              Reply
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-line/90 bg-surface-elevated px-2 py-0.5 text-2xs font-medium text-ink shadow-sm dark:border-line/60 dark:bg-surface-muted"
              onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
            >
              React
            </button>
          </div>
          <AnimatePresence>
            {pickerFor === m.id && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className={cn(
                  'absolute z-20 mt-1 flex gap-0.5 rounded-full border border-line/90 bg-surface-elevated px-2 py-1 shadow-lift dark:border-line/60',
                  isOutgoing ? 'right-0 top-full' : 'left-0 top-full',
                )}
              >
                {EMOJIS.map((e) => (
                  <button key={e} type="button" className="text-lg leading-none" onClick={() => toggleReaction(e)}>
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
