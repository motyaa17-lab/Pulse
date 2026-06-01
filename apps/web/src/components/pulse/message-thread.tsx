'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams } from 'next/navigation';
import { ApiError, apiFetch, toPublicUrl } from '@/lib/api';
import { bumpChatListPreview } from '@/lib/chat-query-helpers';
import { bumpMetaFromMessage } from '@/lib/chat-preview-meta';
import { applyOptimisticReaction } from '@/lib/reaction-optimistic';
import type { ChatListItem, MessageDto, MeUserDto, ResolvedUserLite } from '@/lib/types';
import { connectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/cn';
import { decodeJwtSub } from '@/lib/jwt';
import { uploadMedia } from '@/lib/upload-media';
import { usePendingAttachmentsStore } from '@/stores/pending-attachments-store';
import { Composer } from './composer';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { VoiceMessageBubble } from '@/components/pulse/voice-message-bubble';
import { VideoNoteCircle } from '@/components/pulse/video-note-circle';
import {
  MessageActionsMenu,
  QUICK_REACTION_EMOJIS,
  type MessageMenuAction,
} from './message-actions-menu';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { AnimatePresence, motion } from 'framer-motion';
import { useT, type I18nKey } from '@/lib/i18n';
import { useLanguageStore } from '@/stores/language-store';
import { tgEase, tgFadeIn, tgSheetPop, useReduceMotion } from '@/lib/motion';

/** Messages from the same sender within this window visually stack as one group. */
const GROUP_GAP_MS = 5 * 60 * 1000;

function SingleCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
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

function ThreadInlineImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [bad, setBad] = useState(false);
  const resolved = toPublicUrl(src) ?? src;
  if (bad) {
    return (
      <div
        className={cn(
          className,
          'flex items-center justify-center bg-surface-muted/60 text-[11px] font-medium text-ink-muted',
        )}
      >
        {alt}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved} alt={alt} className={className} onError={() => setBad(true)} />
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

function formatDateDivider(iso: string, t: (k: I18nKey) => string, locale: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diff === 0) return t('today');
  if (diff === 1) return t('yesterday');
  return d.toLocaleDateString(locale, {
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

function patchMessageReactionsForChat(
  qc: QueryClient,
  chatId: string,
  messageId: string,
  reactions: MessageDto['reactions'],
) {
  qc.setQueryData<MessagesQueryData>(['messages', chatId], (old) => {
    if (!old) return old;
    return {
      ...old,
      items: old.items.map((x: MessageDto) => (x.id === messageId ? { ...x, reactions } : x)),
    };
  });
}

async function commitMessageReactionToggle(
  qc: QueryClient,
  chatId: string,
  messageId: string,
  emoji: string,
  myId: string,
): Promise<void> {
  const current = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
  const msg = current?.items?.find((x: MessageDto) => x.id === messageId);
  if (!msg) return;
  const r = msg.reactions.find((x: MessageDto['reactions'][number]) => x.emoji === emoji);
  const hasMine = Boolean(r?.userIds.includes(myId));
  const snapshot = msg.reactions.map((x: MessageDto['reactions'][number]) => ({
    emoji: x.emoji,
    count: x.count,
    userIds: [...x.userIds],
  }));
  const optimistic = applyOptimisticReaction(msg.reactions, emoji, myId, !hasMine);
  patchMessageReactionsForChat(qc, chatId, messageId, optimistic);
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
    patchMessageReactionsForChat(qc, chatId, messageId, reactions);
  } catch {
    patchMessageReactionsForChat(qc, chatId, messageId, snapshot);
  }
}

type MobileReactionPick = {
  messageId: string;
  isOutgoing: boolean;
  rect: { top: number; left: number; width: number; height: number };
  actions: MessageMenuAction[];
};

const FULL_REACTION_EMOJIS = [
  '👍',
  '👎',
  '❤️',
  '🔥',
  '😂',
  '🥰',
  '😮',
  '😢',
  '😡',
  '🎉',
  '🙏',
  '👏',
  '🤝',
  '💯',
  '🤔',
  '👀',
  '😎',
  '🥳',
  '🤯',
  '😴',
  '🤮',
  '🤡',
  '💔',
  '💙',
  '💚',
  '💛',
  '💜',
  '🖤',
  '🤍',
  '⭐',
  '✅',
  '❌',
  '⚡',
  '💸',
  '🎁',
  '🍾',
  '🍿',
  '☕',
  '🍻',
  '🏆',
  '🎧',
  '📌',
  '🫡',
] as const;

function ReactionPickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const t = useT();
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center">
      <button
        type="button"
        className="absolute inset-0"
        aria-label={t('close')}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 36 }
        }
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line/70 bg-surface-elevated/95 shadow-lift backdrop-blur-xl dark:border-white/12 dark:bg-[#1c2834]/96"
      >
        <div className="flex items-center gap-2 border-b border-line/60 px-4 py-3 dark:border-white/10">
          <div className="font-display text-[15px] font-semibold text-ink dark:text-white">
            {t('react')}
          </div>
          <button
            type="button"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-8 gap-1 p-3">
          {FULL_REACTION_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="flex h-10 items-center justify-center rounded-xl text-[1.35rem] transition hover:bg-surface-muted/80 active:scale-[0.98] dark:hover:bg-white/10"
              onClick={() => {
                onPick(e);
                onClose();
              }}
              aria-label={`${t('react')} ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

function ReactionDetailsSheet({
  open,
  onClose,
  emoji,
  userIds,
}: {
  open: boolean;
  onClose: () => void;
  emoji: string;
  userIds: string[];
}) {
  const t = useT();
  const reduceMotion = useReduceMotion();
  const { data } = useQuery({
    queryKey: ['users', 'resolve', emoji, userIds.join(',')],
    queryFn: () =>
      apiFetch<{ items: ResolvedUserLite[] }>('/users/resolve', {
        method: 'POST',
        body: { ids: userIds },
      }),
    enabled: open && userIds.length > 0,
  });

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center">
      <button
        type="button"
        className="absolute inset-0"
        aria-label={t('close')}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 36 }
        }
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line/70 bg-surface-elevated/95 shadow-lift backdrop-blur-xl dark:border-white/12 dark:bg-[#1c2834]/96"
      >
        <div className="flex items-center gap-2 border-b border-line/60 px-4 py-3 dark:border-white/10">
          <div className="font-display text-[15px] font-semibold text-ink dark:text-white">
            {emoji} {t('reactions')}
          </div>
          <button
            type="button"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {(data?.items ?? []).map((u) => {
            const label = u.displayName?.trim() || u.username || t('publicUserFallback');
            return (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-muted/70 dark:hover:bg-white/8"
              >
                <SafeAvatar
                  url={u.avatarUrl}
                  label={label.slice(0, 1).toUpperCase()}
                  className="h-9 w-9 rounded-full"
                  fallbackClassName="text-sm font-bold"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink dark:text-white">
                    {label}
                  </div>
                  <div className="truncate text-[12px] text-ink-muted dark:text-white/55">
                    {u.isOnline ? t('online') : t('offline')}
                  </div>
                </div>
              </div>
            );
          })}
          {(data?.items ?? []).length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-ink-muted">{t('commonLoading')}</div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

function MediaViewerModal({
  open,
  onClose,
  items,
  index,
  onIndex,
}: {
  open: boolean;
  onClose: () => void;
  items: { url: string; mimeType: string; fileName: string }[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const t = useT();
  const reduceMotion = useReduceMotion();
  const item = items[index];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onIndex(Math.min(items.length - 1, index + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, index, items.length, onIndex]);

  if (!open || typeof document === 'undefined' || !item) return null;
  const src = toPublicUrl(item.url) ?? item.url;
  const isVideo = item.mimeType.startsWith('video/');
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: tgEase() }}
      className="fixed inset-0 z-[150] bg-black/95"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div className="absolute left-0 right-0 top-0 z-[2] flex items-center gap-2 px-3 py-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.98]"
          onClick={onClose}
          aria-label={t('close')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/85">
          {item.fileName}
        </div>
        <a
          href={src}
          download
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.98]"
          aria-label={t('download')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3v10m0 0l4-4m-4 4l-4-4M5 17v3h14v-3"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
      {items.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.98] md:flex"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(Math.max(0, index - 1));
            }}
            aria-label={t('prev')}
            disabled={index === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-[2] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 active:scale-[0.98] md:flex"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(Math.min(items.length - 1, index + 1));
            }}
            aria-label={t('next')}
            disabled={index === items.length - 1}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </>
      )}
      <div className="absolute inset-0 flex items-center justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(4rem,env(safe-area-inset-top)+3.5rem)]">
        {isVideo ? (
          <video
            src={src}
            className="max-h-[82vh] w-auto max-w-full rounded-2xl"
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.fileName}
            className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain"
          />
        )}
      </div>
    </motion.div>,
    document.body,
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function MobileMessageActionSheet({
  pick,
  message,
  qc,
  chatId,
  myId,
  onClose,
  onOpenFullPicker,
}: {
  pick: MobileReactionPick;
  message: MessageDto | undefined;
  qc: QueryClient;
  chatId: string;
  myId: string | null;
  onClose: () => void;
  onOpenFullPicker: () => void;
}) {
  const t = useT();
  const [emojiBar, setEmojiBar] = useState({ top: 0, left: 0 });
  const [actionsBox, setActionsBox] = useState({ top: 0, left: 0, width: 280, maxH: 280 });
  const barW = 268;

  useLayoutEffect(() => {
    const { rect } = pick;
    const margin = 10;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const barH = 52;
    const safeTop = Math.max(margin, 0);
    let top = rect.top - barH - 10;
    if (top < safeTop) top = rect.top + rect.height + 10;
    top = clamp(top, safeTop, vh - barH - margin);
    let left = rect.left + rect.width / 2 - barW / 2;
    left = clamp(left, margin, vw - barW - margin);
    setEmojiBar({ top, left });

    const panelW = Math.min(280, vw - margin * 2);
    let panelLeft = rect.left + rect.width / 2 - panelW / 2;
    panelLeft = clamp(panelLeft, margin, vw - panelW - margin);
    const gap = 10;
    const defaultTop = rect.top + rect.height + gap;
    const availableBelow = vh - defaultTop - margin;
    const availableAbove = rect.top - margin;
    let actionsTop = defaultTop;
    let maxH = Math.min(300, Math.max(120, availableBelow));
    if (availableBelow < 120 && availableAbove > availableBelow) {
      maxH = Math.min(300, Math.max(120, availableAbove - gap));
      actionsTop = rect.top - gap - maxH;
      actionsTop = Math.max(margin, actionsTop);
    }
    setActionsBox({ top: actionsTop, left: panelLeft, width: panelW, maxH });
  }, [pick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onResize = () => onClose();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onClose]);

  if (
    typeof document === 'undefined' ||
    !message ||
    message.deletedAt ||
    message.type === 'SYSTEM'
  ) {
    return null;
  }

  const { rect, isOutgoing } = pick;
  const text = message.text?.trim() ?? '';
  const enabledActions = pick.actions.filter((a) => !a.disabled);

  const onPick = async (emoji: string) => {
    const uid = myId ?? qc.getQueryData<{ id: string }>(['me'])?.id;
    if (!uid) return;
    await commitMessageReactionToggle(qc, chatId, message.id, emoji, uid);
    onClose();
  };

  return createPortal(
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[118] touch-none bg-black/50 backdrop-blur-[16px] md:hidden"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[119] md:hidden"
        aria-hidden
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="pointer-events-auto absolute rounded-[1.25rem] shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-2 ring-white/40"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            transformOrigin: 'center center',
          }}
        >
          <div
            className={cn(
              'flex h-full flex-col overflow-hidden rounded-[1.2rem] px-[0.7rem] py-[0.45rem] text-[13.5px] leading-[1.42]',
              isOutgoing
                ? 'bg-bubble-out text-bubble-out-ink ring-1 ring-white/15'
                : 'bg-bubble-in/98 text-ink ring-1 ring-line/45 dark:bg-bubble-in dark:text-ink/95 dark:ring-line/40',
            )}
          >
            <p className="min-h-0 flex-1 select-text whitespace-pre-wrap break-words [-webkit-user-select:text] [user-select:text]">
              {text || (message.attachments?.length ? t('attachment') : '')}
            </p>
            <div
              className={cn(
                'mt-1 shrink-0 select-none text-[0.625rem] tabular-nums',
                isOutgoing ? 'text-right text-bubble-out-ink/70' : 'text-ink-muted',
              )}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </motion.div>
        <motion.div
          role="toolbar"
          aria-label={t('mobileReactionPickerAria')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, type: 'spring', stiffness: 460, damping: 32 }}
          className="pointer-events-auto fixed z-[120] flex items-center gap-0.5 rounded-full border border-line/70 bg-surface-elevated/95 px-2 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/14 dark:bg-[#1c2834]/95 dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)]"
          style={{ top: emojiBar.top, left: emojiBar.left, width: barW }}
        >
          {QUICK_REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex h-11 min-w-[2.75rem] flex-1 touch-manipulation items-center justify-center rounded-full text-[1.35rem] transition active:scale-[0.92] hover:bg-surface-muted/70 dark:hover:bg-white/10"
              onClick={() => void onPick(emoji)}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            className="flex h-11 min-w-[2.75rem] flex-1 touch-manipulation items-center justify-center rounded-full text-[1.15rem] font-bold transition active:scale-[0.92] hover:bg-surface-muted/70 dark:hover:bg-white/10"
            onClick={() => {
              onClose();
              onOpenFullPicker();
            }}
            aria-label={t('react')}
          >
            +
          </button>
        </motion.div>
        <motion.div
          role="menu"
          aria-label={t('messageActionsButtonAria')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, type: 'spring', stiffness: 420, damping: 34 }}
          className="pointer-events-auto fixed z-[120] overflow-y-auto overflow-x-hidden rounded-2xl border border-line/70 bg-surface-elevated/95 py-1 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl scrollbar-thin dark:border-white/12 dark:bg-[#1c2834]/98 dark:shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
          style={{
            top: actionsBox.top,
            left: actionsBox.left,
            width: actionsBox.width,
            maxHeight: actionsBox.maxH,
          }}
        >
          {enabledActions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={cn(
                'flex w-full touch-manipulation items-center px-3.5 py-3 text-left text-[15px] font-medium transition active:bg-white/10',
                a.danger
                  ? 'text-red-600 hover:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15'
                  : 'text-ink hover:bg-surface-muted/80 dark:text-white/95 dark:hover:bg-white/8',
              )}
              onClick={() => {
                a.onSelect();
                onClose();
              }}
              role="menuitem"
            >
              <span className="truncate">{a.label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </>,
    document.body,
  );
}

export function MessageThread({ chatId }: { chatId: string }) {
  const qc = useQueryClient();
  const t = useT();
  const reduceMotion = useReduceMotion();
  const locale = useLanguageStore((s) => (s.language === 'ru' ? 'ru-RU' : 'en-US'));
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(accessToken) && sessionStatus === 'ok';
  const myIdFromToken = decodeJwtSub(accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);
  const addPending = usePendingAttachmentsStore((s) => s.add);
  const parentRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const [dragActive, setDragActive] = useState(false);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const [editing, setEditing] = useState<MessageDto | null>(null);
  const [forwarding, setForwarding] = useState<MessageDto | MessageDto[] | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fullReactionFor, setFullReactionFor] = useState<string | null>(null);
  const [reactionDetails, setReactionDetails] = useState<null | {
    emoji: string;
    userIds: string[];
  }>(null);
  const [mediaViewer, setMediaViewer] = useState<null | {
    items: { url: string; mimeType: string; fileName: string }[];
    index: number;
  }>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [mobileReactionPick, setMobileReactionPick] = useState<MobileReactionPick | null>(null);
  const params = useSearchParams();
  const highlightId = params.get('highlight');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const { data: meUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
    enabled: canQuery,
  });
  const myId = myIdFromToken ?? meUser?.id ?? null;

  const toggleReaction = async (messageId: string, emoji: string) => {
    const uid = myId;
    if (!uid) return;
    await commitMessageReactionToggle(qc, chatId, messageId, emoji, uid);
  };

  const { data: chatMeta } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
    enabled: canQuery,
  });
  const canPost = !chatMeta?.role || chatMeta.type !== 'CHANNEL' || chatMeta.role !== 'SUBSCRIBER';

  const { data: chatsForForward } = useQuery<ChatListItem[]>({
    queryKey: ['chats'],
    queryFn: () => apiFetch<ChatListItem[]>('/chats'),
    enabled: canQuery && Boolean(forwarding),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () =>
      apiFetch<{ items: MessageDto[]; nextCursor: string | null }>(
        `/chats/${chatId}/messages?take=80`,
      ),
    enabled: canQuery,
  });

  const messages = data?.items ?? [];
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    // Reset transient chat-local UI when switching chats.
    setSelectMode(false);
    setSelectedIds([]);
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileReactionPick) return;
    const el = parentRef.current;
    const close = () => setMobileReactionPick(null);
    el?.addEventListener('scroll', close, { passive: true });
    return () => el?.removeEventListener('scroll', close);
  }, [mobileReactionPick]);

  useEffect(() => {
    if (!mobileReactionPick) return;
    if (!messages.some((x) => x.id === mobileReactionPick.messageId)) {
      setMobileReactionPick(null);
    }
  }, [messages, mobileReactionPick]);

  const cancelHoverLeaveTimer = () => {
    if (hoverLeaveTimer.current) {
      clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedMessages = useMemo(
    () => messages.filter((m) => selectedSet.has(m.id)),
    [messages, selectedSet],
  );

  const enterSelectWith = (id: string) => {
    setSelectMode(true);
    setSelectedIds((cur) => (cur.includes(id) ? cur : [...cur, id]));
    setMenuFor(null);
    setMobileReactionPick(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  useEffect(() => {
    if (!selectMode) return;
    if (selectedIds.length === 0) setSelectMode(false);
  }, [selectMode, selectedIds.length]);

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

    const patchMessages = (
      fn: (old: MessagesQueryData | undefined) => MessagesQueryData | undefined,
    ) => {
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
      const meta = bumpMetaFromMessage(msg);
      bumpChatListPreview(qc, chatId, meta.preview, msg.createdAt, {
        lastMessageType: meta.lastMessageType,
        lastAttachmentKind: meta.lastAttachmentKind,
      });
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
            if (new Date(x.createdAt).getTime() <= pivotTs)
              return { ...x, deliveryStatus: 'DELIVERED' };
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

    const onMessageHidden = (payload: unknown) => {
      const p = payload as { chatId?: string; messageId?: string };
      if (!p?.chatId || p.chatId !== chatId || !p.messageId) return;
      patchMessages((old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((x) => x.id !== p.messageId) };
      });
      void qc.invalidateQueries({ queryKey: ['chats'] });
      void qc.invalidateQueries({ queryKey: ['chat', chatId] });
    };

    s.on('message:new', onMessageNew);
    s.on('message:updated', onMessageUpdated);
    s.on('reaction:update', onReactionUpdate);
    s.on('message:deliveredUpdate', onDeliveredUpdate);
    s.on('message:readUpdate', onReadUpdate);
    s.on('message:hidden', onMessageHidden);
    return () => {
      s.off('connect', joinRoom);
      s.emit('chat:leave', { chatId });
      s.off('message:new', onMessageNew);
      s.off('message:updated', onMessageUpdated);
      s.off('reaction:update', onReactionUpdate);
      s.off('message:deliveredUpdate', onDeliveredUpdate);
      s.off('message:readUpdate', onReadUpdate);
      s.off('message:hidden', onMessageHidden);
    };
  }, [accessToken, chatId, myId, qc, t]);

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
    try {
      const src = forwarding;
      const batch = (Array.isArray(src) ? src : src ? [src] : []).filter(Boolean);
      if (batch.length === 0) return;
      const usable = batch.filter(
        (m) => !m.deletedAt && (Boolean(m.text?.trim()) || Boolean(m.attachments?.length)),
      );
      if (usable.length === 0) {
        window.alert(t('forwardNothingToSend'));
        return;
      }

      let lastCreated: MessageDto | null = null;
      for (const m of usable) {
        lastCreated = await apiFetch<MessageDto>(`/chats/${targetChatId}/messages`, {
          method: 'POST',
          body: { forwardedFromMessageId: m.id },
        });
      }
      if (lastCreated) {
        const meta = bumpMetaFromMessage(lastCreated);
        bumpChatListPreview(
          qc,
          targetChatId,
          lastCreated.text?.trim()
            ? lastCreated.text.slice(0, 160)
            : meta.preview || t('previewForwarded'),
          lastCreated.createdAt,
          {
            lastMessageType: meta.lastMessageType,
            lastAttachmentKind: meta.lastAttachmentKind,
          },
        );
      }
      setForwarding(null);
    } catch {
      window.alert(t('forwardFailedAlert'));
    }
  };

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    let raf: number | null = null;
    let lastShow: boolean | null = null;
    const onScroll = () => {
      // Close the message actions menu when the user scrolls.
      // Functional update avoids stale closures and is a no-op if already null.
      setMenuFor((cur) => (cur === null ? cur : null));

      if (raf != null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        const nextShow = dist > 180;
        if (lastShow === null) lastShow = nextShow;
        if (nextShow !== lastShow) {
          lastShow = nextShow;
          setShowScrollToBottom(nextShow);
        }
      });
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [chatId]);

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
          {t('commonLoading')}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={parentRef}
        className="scrollbar-thin chat-thread-bg relative isolate min-h-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 py-2 [-webkit-overflow-scrolling:touch] md:px-5 md:py-2.5"
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!canPost) return;
          dragDepth.current += 1;
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!canPost) return;
          if (!dragActive) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!canPost) return;
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragActive(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          dragDepth.current = 0;
          setDragActive(false);
          if (!canPost) return;
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
        {selectMode && (
          <div className="sticky top-0 z-[60] -mx-3 mb-2 border-b border-line/60 bg-surface-elevated/92 px-3 py-2 backdrop-blur-xl dark:border-white/12 dark:bg-[rgb(var(--tg-panel))]/92 md:-mx-5 md:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full px-2 py-1 text-[13px] font-semibold text-accent transition hover:bg-surface-muted/75 dark:hover:bg-white/10"
                onClick={() => {
                  setSelectMode(false);
                  setSelectedIds([]);
                }}
              >
                {t('cancel')}
              </button>
              <div className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink dark:text-white">
                {selectedIds.length} {t('selected')}
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-muted/75 active:scale-[0.98] dark:text-white dark:hover:bg-white/10"
                aria-label={t('msgCopyText')}
                disabled={selectedMessages.every((m) => !m.text?.trim())}
                onClick={async () => {
                  const text = selectedMessages
                    .map((m) => (m.text ?? '').trim())
                    .filter(Boolean)
                    .join('\n\n');
                  if (!text) return;
                  try {
                    await navigator.clipboard.writeText(text);
                  } catch {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M8 8h12v12H8V8zM4 4h12v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-surface-muted/75 active:scale-[0.98] dark:text-white dark:hover:bg-white/10"
                aria-label={t('msgForward')}
                onClick={() => {
                  const sorted = [...selectedMessages].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                  );
                  if (sorted.length) setForwarding(sorted);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M14 9l7-7v20l-7-7H4V9h10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition hover:bg-red-500/10 active:scale-[0.98] dark:text-red-300 dark:hover:bg-red-500/15"
                aria-label={t('deleteForMe')}
                onClick={async () => {
                  if (selectedIds.length === 0) return;
                  const ok = window.confirm(t('confirmDeleteForMe'));
                  if (!ok) return;
                  const ids = [...selectedIds];
                  setSelectMode(false);
                  setSelectedIds([]);
                  for (const id of ids) {
                    try {
                      await apiFetch(`/chats/${chatId}/messages/${id}?forMe=1`, {
                        method: 'DELETE',
                      });
                    } catch {
                      /* ignore */
                    }
                  }
                  void qc.invalidateQueries({ queryKey: ['messages', chatId] });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 7h16M10 11v7M14 11v7M6 7l1 14h10l1-14M9 7V4h6v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        {dragActive && (
          <div className="pointer-events-none absolute inset-0 z-[50] flex items-center justify-center">
            <div className="rounded-2xl border border-line/70 bg-surface-elevated/85 px-4 py-3 text-sm font-semibold text-ink shadow-lg backdrop-blur dark:border-line/45 dark:bg-surface-elevated/65">
              {t('dropFilesToUpload')}
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
                  i % 2 === 0
                    ? 'ml-auto w-[70%] bg-bubble-out/18'
                    : 'mr-auto w-[66%] bg-bubble-in/45',
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
            <p className="mt-4 font-display text-xl font-semibold text-ink">{t('quietHere')}</p>
            <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">
              {t('quietHereSubtitle')}
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
                  chatType={chatMeta?.type}
                  channelSubscriberRestricted={!canPost}
                  highlighted={highlighted === m.id}
                  onReply={() => setReplyTo(m)}
                  onForward={() => setForwarding(m)}
                  onToggleReaction={toggleReaction}
                  onShowReactionDetails={(emoji, userIds) => setReactionDetails({ emoji, userIds })}
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
                  selectMode={selectMode}
                  selected={selectedSet.has(m.id)}
                  onToggleSelected={() => toggleSelected(m.id)}
                  onEnterSelectMode={() => enterSelectWith(m.id)}
                  onOpenMedia={(items, index) => setMediaViewer({ items, index })}
                  chatId={chatId}
                  onMessageRowEnter={onMessageRowEnter}
                  onMessageRowLeave={onMessageRowLeave}
                  closeOnScrollEl={parentRef}
                  mobileReactionPickId={mobileReactionPick?.messageId ?? null}
                  onRequestMobileReactionPicker={(messageId, rect, isOutgoing, sheetActions) => {
                    if (selectMode) return;
                    setMenuFor(null);
                    setMobileReactionPick({
                      messageId,
                      isOutgoing,
                      actions: sheetActions,
                      rect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                      },
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: tgEase() }}
            className="pointer-events-auto absolute bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-line/70 bg-surface-elevated/95 text-ink shadow-lg backdrop-blur-md transition hover:bg-surface-elevated active:scale-[0.97] dark:border-white/15 dark:bg-[rgb(var(--tg-panel))]/95 dark:text-white dark:hover:bg-[rgb(var(--tg-panel))]/90 md:bottom-[4.5rem] md:right-5"
            onClick={() => {
              const el = parentRef.current;
              if (!el) return;
              el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
            }}
            aria-label={t('scrollToBottomAria')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      {mobileReactionPick && messages.some((x) => x.id === mobileReactionPick.messageId) ? (
        <MobileMessageActionSheet
          pick={mobileReactionPick}
          message={messages.find((x) => x.id === mobileReactionPick.messageId)!}
          qc={qc}
          chatId={chatId}
          myId={myId}
          onClose={() => setMobileReactionPick(null)}
          onOpenFullPicker={() => setFullReactionFor(mobileReactionPick.messageId)}
        />
      ) : null}
      <ReactionPickerModal
        open={Boolean(fullReactionFor)}
        onClose={() => setFullReactionFor(null)}
        onPick={(emoji) => {
          const id = fullReactionFor;
          if (!id) return;
          void toggleReaction(id, emoji);
        }}
      />
      <ReactionDetailsSheet
        open={Boolean(reactionDetails)}
        onClose={() => setReactionDetails(null)}
        emoji={reactionDetails?.emoji ?? '👍'}
        userIds={reactionDetails?.userIds ?? []}
      />
      <MediaViewerModal
        open={Boolean(mediaViewer)}
        onClose={() => setMediaViewer(null)}
        items={mediaViewer?.items ?? []}
        index={mediaViewer?.index ?? 0}
        onIndex={(i) =>
          setMediaViewer((cur) =>
            cur ? { ...cur, index: Math.max(0, Math.min(cur.items.length - 1, i)) } : cur,
          )
        }
      />
      <Composer
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
        canPost={canPost}
      />
      {forwarding && (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/35 p-4 backdrop-blur-[1px] md:items-center"
          role="dialog"
          aria-label={t('forwardMessageTitle')}
          onMouseDown={() => setForwarding(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-line/80 bg-surface-elevated shadow-lift dark:border-line/55 dark:bg-surface-elevated/98"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2.5 dark:border-line/45">
              <div className="font-display text-[0.95rem] font-semibold text-ink">
                {t('forwardTo')}
              </div>
              <button
                type="button"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted/80 hover:text-ink dark:hover:bg-surface-muted/35"
                onClick={() => setForwarding(null)}
                aria-label={t('close')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-1.5">
              {(chatsForForward ?? []).map((c) => {
                const label =
                  c.title ?? c.peer?.displayName ?? c.peer?.username ?? t('chatFallback');
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
                <div className="px-3 py-6 text-center text-sm text-ink-muted">
                  {t('noChatsFound')}
                </div>
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
  chatType,
  channelSubscriberRestricted = false,
  highlighted,
  onReply,
  onForward,
  onToggleReaction,
  onShowReactionDetails,
  onEdit,
  onDelete,
  menuOpen,
  setMenuOpen,
  selectMode,
  selected,
  onToggleSelected,
  onEnterSelectMode,
  onOpenMedia,
  chatId,
  onMessageRowEnter,
  onMessageRowLeave,
  closeOnScrollEl,
  mobileReactionPickId,
  onRequestMobileReactionPicker,
}: {
  m: MessageDto;
  prev?: MessageDto;
  next?: MessageDto;
  myId?: string;
  chatType?: string;
  /** Channel subscribers cannot edit, delete for everyone, or pin. */
  channelSubscriberRestricted?: boolean;
  highlighted: boolean;
  onReply: () => void;
  onForward: () => void;
  onToggleReaction: (messageId: string, emoji: string) => void | Promise<void>;
  onShowReactionDetails: (emoji: string, userIds: string[]) => void;
  onEdit: () => void;
  onDelete: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  selectMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
  onEnterSelectMode: () => void;
  onOpenMedia: (
    items: { url: string; mimeType: string; fileName: string }[],
    index: number,
  ) => void;
  chatId: string;
  onMessageRowEnter: (id: string) => void;
  onMessageRowLeave: () => void;
  closeOnScrollEl: React.RefObject<HTMLDivElement | null>;
  mobileReactionPickId: string | null;
  onRequestMobileReactionPicker?: (
    messageId: string,
    rect: DOMRect,
    isOutgoing: boolean,
    actions: MessageMenuAction[],
  ) => void;
}) {
  const qc = useQueryClient();
  const t = useT();
  const reduceMotion = useReduceMotion();
  const locale = useLanguageStore((s) => (s.language === 'ru' ? 'ru-RU' : 'en-US'));
  const isDeleted = Boolean(m.deletedAt);
  const isSystem = m.type === 'SYSTEM';
  const showTrigger = menuOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    swipeLocked: boolean;
    pointerId: number;
  } | null>(null);
  const [bubblePressing, setBubblePressing] = useState(false);
  const [swipePx, setSwipePx] = useState(0);
  const [swipeDragging, setSwipeDragging] = useState(false);
  const isNew = useMemo(() => Date.now() - new Date(m.createdAt).getTime() < 2500, [m.createdAt]);

  const clearLongPressTimer = () => {
    if (longPressTimer.current != null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setBubblePressing(false);
  };

  useEffect(() => () => clearLongPressTimer(), []);

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

  const softDelete = async () => {
    const isOutgoing = Boolean(myId && m.senderId === myId);
    const canDeleteEveryone = isOutgoing && !isDeleted;
    if (!canDeleteEveryone) return;
    if (!window.confirm(t('confirmDeleteForEveryone'))) return;
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
      bumpChatListPreview(qc, chatId, t('previewMessageDeleted'), updated.createdAt, {
        clearListMeta: true,
      });
      void qc.invalidateQueries({ queryKey: ['chats'] });
    } catch {
      qc.setQueryData(['messages', chatId], snapshot);
    }
  };

  const deleteForMe = async () => {
    if (!window.confirm(t('confirmDeleteForMe'))) return;
    onDelete();
    setMenuOpen(false);

    const snapshot = qc.getQueryData<MessagesQueryData>(['messages', chatId]);
    qc.setQueryData<MessagesQueryData>(['messages', chatId], (old) => {
      if (!old) return old;
      return { ...old, items: old.items.filter((x) => x.id !== m.id) };
    });

    try {
      await apiFetch<{ ok: boolean; chatId: string; messageId: string }>(
        `/chats/${chatId}/messages/${m.id}?forMe=1`,
        { method: 'DELETE' },
      );
      void qc.invalidateQueries({ queryKey: ['chats'] });
      void qc.invalidateQueries({ queryKey: ['chat', chatId] });
    } catch {
      qc.setQueryData(['messages', chatId], snapshot);
    }
  };

  const pinOrUnpin = async (messageId: string | null) => {
    try {
      const currentPinned = (qc.getQueryData(['chat', chatId]) as any)?.pinnedMessage?.id ?? null;
      const nextId = messageId && currentPinned === messageId ? null : messageId;
      const res = await apiFetch<{ ok: boolean; pinnedMessageId: string | null }>(
        `/chats/${chatId}/pin-message`,
        {
          method: 'POST',
          body: { messageId: nextId },
        },
      );
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
      window.alert(t('pinFailedAlert'));
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
  const canEdit = isOutgoing && !isDeleted && m.type === 'TEXT' && !channelSubscriberRestricted;
  const canDeleteEveryone = isOutgoing && !isDeleted && !channelSubscriberRestricted;
  const canCopy = Boolean(m.text && !isDeleted);
  const showDate = !prev || !sameCalendarDay(prev.createdAt, m.createdAt);
  const firstInGroup = !prev || prev.type === 'SYSTEM' || !inSameGroup(prev, m);
  const lastInGroup = !next || next.type === 'SYSTEM' || !inSameGroup(m, next);
  const showSenderHeader =
    !isOutgoing &&
    firstInGroup &&
    Boolean(m.senderId) &&
    (chatType === 'GROUP' || chatType === 'CHANNEL') &&
    Boolean(m.sender);

  const actions = useMemo(
    () => [
      {
        id: 'reply',
        label: t('msgReply'),
        onSelect: onReply,
      },
      {
        id: 'select',
        label: t('select'),
        disabled: isDeleted,
        onSelect: () => {
          setMenuOpen(false);
          onEnterSelectMode();
        },
      },
      {
        id: 'copy-link',
        label: t('msgCopyLink'),
        disabled: isDeleted,
        onSelect: async () => {
          setMenuOpen(false);
          const url = `${window.location.origin}/chats/${chatId}?highlight=${encodeURIComponent(m.id)}`;
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            const ta = document.createElement('textarea');
            ta.value = url;
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
        id: 'forward',
        label: t('msgForward'),
        disabled: isDeleted || (!m.text?.trim() && !(m.attachments && m.attachments.length > 0)),
        onSelect: () => {
          setMenuOpen(false);
          onForward();
        },
      },
      {
        id: 'report',
        label: t('msgReport'),
        disabled: isDeleted,
        onSelect: async () => {
          setMenuOpen(false);
          const note = window.prompt(t('msgReportPrompt'));
          if (note === null) return;
          try {
            await apiFetch(`/chats/${chatId}/messages/${m.id}/report`, {
              method: 'POST',
              body: { note: note.trim() || undefined },
            });
            window.alert(t('msgReportThanks'));
          } catch (e) {
            window.alert(
              e instanceof ApiError && e.status === 409
                ? t('msgReportDuplicate')
                : t('msgReportFailed'),
            );
          }
        },
      },
      {
        id: 'pin',
        label:
          ((qc.getQueryData(['chat', chatId]) as any)?.pinnedMessage?.id ?? null) === m.id
            ? t('msgUnpin')
            : t('msgPin'),
        disabled: isDeleted || channelSubscriberRestricted,
        onSelect: () => pinOrUnpin(m.id),
      },
      {
        id: 'copy',
        label: t('msgCopyText'),
        disabled: !canCopy,
        onSelect: async () => {
          const textToCopy = m.text ?? '';
          try {
            await navigator.clipboard.writeText(textToCopy);
          } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = textToCopy;
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
        label: t('msgEdit'),
        disabled: !canEdit,
        onSelect: () => {
          setMenuOpen(false);
          onEdit();
        },
      },
      {
        id: 'delete-everyone',
        label: t('deleteForEveryone'),
        danger: true,
        disabled: !canDeleteEveryone,
        onSelect: softDelete,
      },
      {
        id: 'delete-me',
        label: t('deleteForMe'),
        onSelect: deleteForMe,
      },
    ],
    [
      canCopy,
      canDeleteEveryone,
      canEdit,
      channelSubscriberRestricted,
      chatId,
      deleteForMe,
      isDeleted,
      locale,
      m.id,
      m.text,
      onEdit,
      onEnterSelectMode,
      onForward,
      onReply,
      pinOrUnpin,
      qc,
      setMenuOpen,
      softDelete,
      t,
    ],
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

  const isRoundVideoNote = useMemo(() => {
    if (isDeleted || !m.attachments || m.attachments.length !== 1) return false;
    const a = m.attachments[0];
    if (a.kind !== 'video') return false;
    const d = a.durationSec ?? 0;
    return d > 0 && d <= 120;
  }, [isDeleted, m.attachments]);

  const isRoundVideoNoteLayout = useMemo(
    () => isRoundVideoNote && !m.replyTo && !m.forwardedFromMessageId && !m.text?.trim(),
    [isRoundVideoNote, m.forwardedFromMessageId, m.replyTo, m.text],
  );

  const messageMetaFooter = useMemo(
    () => (
      <>
        <span>
          {new Date(m.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {m.editedAt && <span className="opacity-75">{t('edited')}</span>}
        {isOutgoing && lastInGroup && m.deliveryStatus && (
          <motion.span
            key={m.deliveryStatus}
            initial={{ scale: 0.88, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 26 }}
            className="ml-0.5 inline-flex items-center gap-0.5 opacity-80"
            aria-label={m.deliveryStatus}
          >
            {m.deliveryStatus === 'SENDING' ? (
              <span className="text-[9px] font-bold uppercase tracking-[0.06em]">…</span>
            ) : m.deliveryStatus === 'SENT' ? (
              <SingleCheckIcon className="h-3 w-3" />
            ) : (
              <DoubleCheckIcon className="h-3 w-3" />
            )}
          </motion.span>
        )}
      </>
    ),
    [isOutgoing, lastInGroup, m.createdAt, m.deliveryStatus, m.editedAt, t],
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
      transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: tgEase() }}
      className={rowTopSpace}
    >
      {showDate && (
        <div className="mb-2 flex justify-center">
          <span className="rounded-full bg-surface-elevated/80 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-muted/90 shadow-sm ring-1 ring-line/35 backdrop-blur dark:bg-surface-elevated/85 dark:ring-line/40">
            {formatDateDivider(m.createdAt, t, locale)}
          </span>
        </div>
      )}
      <div className={cn('flex w-full', isOutgoing ? 'justify-end' : 'justify-start')}>
        <div
          className={cn(
            'group relative max-w-[min(85vw,34rem)] overflow-x-hidden pt-8 -mt-8 max-md:touch-pan-y',
            isOutgoing ? 'ml-auto' : 'mr-auto',
            mobileReactionPickId === m.id && 'max-md:opacity-0 max-md:pointer-events-none',
          )}
          onMouseEnter={() => onMessageRowEnter(m.id)}
          onMouseLeave={onMessageRowLeave}
          onPointerDown={(e) => {
            if (selectMode) {
              if (e.button !== 0) return;
              onToggleSelected();
              return;
            }
            if (!onRequestMobileReactionPicker || isDeleted) return;
            if (typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches)
              return;
            if (menuOpen) return;
            if (e.button !== 0) return;
            // iOS: allow touch gestures (long-press + swipe-to-reply).
            // Avoid pointer-capture for touch to keep scrolling/taps reliable.
            clearLongPressTimer();
            setSwipePx(0);
            setSwipeDragging(false);
            gestureRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              swipeLocked: false,
              pointerId: e.pointerId,
            };
            setBubblePressing(true);
            if (e.pointerType !== 'touch') {
              try {
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
            }
            longPressTimer.current = window.setTimeout(() => {
              longPressTimer.current = null;
              const g = gestureRef.current;
              if (g?.swipeLocked) {
                setBubblePressing(false);
                return;
              }
              if (!onRequestMobileReactionPicker) {
                setBubblePressing(false);
                return;
              }
              const el = bubbleRef.current;
              if (el) {
                onRequestMobileReactionPicker(
                  m.id,
                  el.getBoundingClientRect(),
                  isOutgoing,
                  actions,
                );
                try {
                  navigator.vibrate?.(12);
                } catch {
                  /* ignore */
                }
              }
              setBubblePressing(false);
            }, 440);
          }}
          onPointerMove={(e) => {
            const g = gestureRef.current;
            if (!g || e.pointerId !== g.pointerId) return;
            const dx = e.clientX - g.startX;
            const dy = e.clientY - g.startY;
            if (!g.swipeLocked) {
              if (longPressTimer.current != null) {
                if (Math.hypot(dx, dy) > 14) {
                  if (dx > 10 && dx > Math.abs(dy) * 1.15) {
                    g.swipeLocked = true;
                    setSwipeDragging(true);
                    clearLongPressTimer();
                    setSwipePx(Math.min(72, Math.max(0, dx)));
                  } else {
                    clearLongPressTimer();
                  }
                }
              }
            } else {
              setSwipePx(Math.min(72, Math.max(0, dx)));
            }
          }}
          onPointerUp={(e) => {
            const g = gestureRef.current;
            if (g && e.pointerId === g.pointerId && g.swipeLocked) {
              const dx = e.clientX - g.startX;
              if (dx > 48) onReply();
            }
            if (e.pointerType !== 'touch') {
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
            }
            gestureRef.current = null;
            setSwipePx(0);
            setSwipeDragging(false);
            clearLongPressTimer();
          }}
          onPointerCancel={(e) => {
            if (e.pointerType !== 'touch') {
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {
                /* ignore */
              }
            }
            gestureRef.current = null;
            setSwipePx(0);
            setSwipeDragging(false);
            clearLongPressTimer();
          }}
        >
          <div
            className="pointer-events-none absolute bottom-2 left-1 top-10 z-0 flex w-11 items-center justify-center rounded-xl bg-[#3390ec]/35 max-md:flex md:hidden"
            style={{ opacity: Math.min(1, swipePx / 56) }}
            aria-hidden
          >
            <span className="sr-only">{t('swipeReplyHint')}</span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
              aria-hidden
            >
              <path
                d="M9 14l-4-4 4-4M5 10h11a4 4 0 014 4v1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className={cn(
              'relative z-[1]',
              !swipeDragging && 'max-md:transition-transform max-md:duration-150 max-md:ease-out',
            )}
            style={{
              transform: swipePx ? `translateX(${swipePx}px)` : undefined,
            }}
          >
            {selectMode && (
              <button
                type="button"
                className={cn(
                  'absolute -left-10 top-1/2 z-[70] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border bg-surface-elevated/95 backdrop-blur',
                  selected
                    ? 'border-[#3390ec] text-white bg-[#3390ec]'
                    : 'border-line/70 text-transparent dark:border-white/20',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelected();
                }}
                aria-label={t('select')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {!isDeleted && (
              <div
                className={cn(
                  'pointer-events-none absolute -top-8 z-[44] hidden max-w-full gap-0.5 rounded-full border border-line/60 bg-surface-elevated/95 px-1 py-0.5 opacity-0 shadow-md backdrop-blur-sm transition group-hover:pointer-events-auto group-hover:opacity-100 dark:border-line/45 dark:bg-surface-elevated/90 md:flex',
                  isOutgoing ? 'right-0' : 'left-0',
                )}
              >
                {QUICK_REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="pointer-events-auto rounded-md px-1 text-[0.95rem] leading-none text-ink transition hover:bg-surface-muted/90 dark:hover:bg-surface-muted/50"
                    onClick={() => void onToggleReaction(m.id, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <div
              className={cn(
                'absolute top-1 z-[45] hidden md:block',
                isOutgoing ? 'right-0' : 'left-0',
              )}
            >
              <button
                ref={triggerRef}
                type="button"
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border border-line/80 bg-surface-elevated text-ink-muted shadow-sm transition',
                  'hover:bg-surface-muted hover:text-ink dark:border-line/55 dark:bg-surface-muted/35',
                  menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={t('messageActionsButtonAria')}
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
            </div>
            <MessageActionsMenu
              open={menuOpen}
              anchorRef={triggerRef}
              onClose={() => setMenuOpen(false)}
              actions={actions}
              showReactions={!isDeleted}
              onReact={(emoji) => void onToggleReaction(m.id, emoji)}
              closeOnScrollEl={closeOnScrollEl}
            />
            <div
              ref={bubbleRef}
              className={cn(
                'chat-bubble-touch relative z-[1] text-[13.5px] leading-[1.42] max-md:transition-[transform,box-shadow,filter] max-md:duration-200 max-md:ease-out',
                isRoundVideoNoteLayout
                  ? 'rounded-none bg-transparent p-0 text-ink shadow-none ring-0 dark:bg-transparent dark:text-ink/95 dark:shadow-none dark:ring-0'
                  : cn(
                      'px-[0.7rem] py-[0.45rem]',
                      bubbleRadius,
                      isOutgoing
                        ? 'bg-bubble-out text-bubble-out-ink shadow-md shadow-black/[0.07] ring-1 ring-black/[0.06] dark:shadow-lg dark:shadow-black/40 dark:ring-white/10'
                        : 'bg-bubble-in/98 text-ink shadow-sm ring-1 ring-line/45 dark:bg-bubble-in dark:text-ink/95 dark:ring-line/40 dark:shadow-black/20',
                    ),
                highlighted && !isRoundVideoNoteLayout && 'ring-2 ring-accent/55',
                isDeleted && 'opacity-75',
                bubblePressing &&
                  'max-md:scale-[0.97] max-md:shadow-lg max-md:ring-2 max-md:ring-accent/50 max-md:brightness-[0.96]',
              )}
              onContextMenu={(e) => {
                if (typeof window === 'undefined') return;
                if (window.matchMedia('(max-width: 767px)').matches) e.preventDefault();
              }}
              onDoubleClick={() => {
                if (isSystem || isDeleted) return;
                void onToggleReaction(m.id, '❤️');
              }}
            >
              {showSenderHeader && (
                <div className="mb-1 flex items-center gap-2">
                  <SafeAvatar
                    url={m.sender?.avatarUrl ?? null}
                    label={(m.sender?.displayName ?? m.sender?.username ?? '?')
                      .slice(0, 1)
                      .toUpperCase()}
                    className="h-5 w-5 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                    fallbackClassName="text-[10px] font-bold"
                  />
                  <span className="min-w-0 truncate text-[12px] font-semibold text-ink/70 dark:text-ink/80">
                    {m.sender?.displayName ?? m.sender?.username}
                  </span>
                  {m.sender?.username && (
                    <span className="shrink-0 text-[11px] text-ink-muted/80">
                      @{m.sender.username}
                    </span>
                  )}
                </div>
              )}
              {m.replyTo && (
                <div
                  className={cn(
                    'mb-1 border-l-[2px] pl-2 text-[0.65rem] leading-snug opacity-90',
                    isOutgoing
                      ? 'border-bubble-out-ink/45'
                      : 'border-accent/55 dark:border-accent/45',
                  )}
                >
                  <span className="line-clamp-2 block">
                    {m.replyTo.deletedAt ? t('originalMessageRemoved') : m.replyTo.text}
                  </span>
                </div>
              )}
              {m.forwardedFromMessageId && (
                <div
                  className={cn(
                    'mb-1 rounded-md border-l-[2px] bg-black/[0.04] pl-2 py-0.5 text-[0.65rem] leading-snug opacity-95 dark:bg-white/[0.06]',
                    isOutgoing
                      ? 'border-bubble-out-ink/45'
                      : 'border-accent/55 dark:border-accent/45',
                  )}
                >
                  <span className="font-bold uppercase tracking-[0.1em]">{t('forwarded')}</span>{' '}
                  {m.forwardedFromUser ? (
                    <span className="opacity-90">
                      {t('forwardedFrom')}{' '}
                      {m.forwardedFromUser.displayName ?? m.forwardedFromUser.username}
                    </span>
                  ) : null}
                </div>
              )}
              {(!isRoundVideoNoteLayout || isDeleted || Boolean(m.text?.trim())) && (
                <p
                  className={cn(
                    'whitespace-pre-wrap break-words',
                    isDeleted && 'italic opacity-75',
                  )}
                >
                  {isDeleted ? t('messageDeleted') : m.text ? linkify(m.text) : null}
                </p>
              )}
              {m.attachments?.length > 0 && (
                <div className={cn('space-y-2', !isRoundVideoNoteLayout && 'mt-2')}>
                  {m.attachments.map((a, ai) =>
                    a.kind === 'image' ? (
                      <button
                        key={a.id}
                        type="button"
                        className="block w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMedia(
                            m.attachments.map((x) => ({
                              url: x.url,
                              mimeType: x.mimeType,
                              fileName: x.fileName,
                            })),
                            ai,
                          );
                        }}
                        aria-label={t('openMedia')}
                      >
                        <ThreadInlineImage
                          src={a.url}
                          alt={a.fileName}
                          className="max-h-56 w-full rounded-xl object-cover"
                        />
                      </button>
                    ) : a.kind === 'voice' ? (
                      <VoiceMessageBubble
                        key={a.id}
                        url={a.url}
                        durationSec={a.durationSec}
                        isOutgoing={isOutgoing}
                      />
                    ) : a.kind === 'video' ? (
                      (a.durationSec ?? 0) > 0 && (a.durationSec ?? 999) <= 120 ? (
                        <div key={a.id} className="relative inline-block">
                          <VideoNoteCircle
                            src={a.url}
                            className="aspect-square w-[min(72vw,260px)] max-w-[260px] shadow-md ring-1 ring-black/20 dark:ring-white/15"
                          />
                          {isRoundVideoNoteLayout && (
                            <div className="pointer-events-none absolute bottom-1 right-1 z-[2] flex max-w-[calc(100%-0.5rem)] flex-wrap items-center justify-end gap-x-1 gap-y-0 text-[0.625rem] tabular-nums text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {messageMetaFooter}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          key={a.id}
                          type="button"
                          className="block w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMedia(
                              m.attachments.map((x) => ({
                                url: x.url,
                                mimeType: x.mimeType,
                                fileName: x.fileName,
                              })),
                              ai,
                            );
                          }}
                          aria-label={t('openMedia')}
                        >
                          <video
                            src={toPublicUrl(a.url) ?? a.url}
                            className="max-h-72 w-full max-w-[min(100%,20rem)] rounded-2xl object-cover shadow-md ring-1 ring-black/15 dark:ring-white/15"
                            controls={false}
                            muted
                            playsInline
                            preload="metadata"
                          />
                        </button>
                      )
                    ) : (
                      <a
                        key={a.id}
                        href={toPublicUrl(a.url) ?? a.url}
                        className={cn(
                          'block rounded-xl px-3 py-2 text-2xs font-medium underline-offset-2 hover:underline',
                          isOutgoing
                            ? 'bg-black/10 text-bubble-out-ink'
                            : 'bg-black/5 text-accent dark:bg-black/20',
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
              {!isRoundVideoNoteLayout && (
                <div
                  className={cn(
                    'mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0 text-[0.625rem] tabular-nums',
                    isOutgoing ? 'justify-end text-bubble-out-ink/70' : 'text-ink-muted',
                  )}
                >
                  {messageMetaFooter}
                </div>
              )}
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
                      onClick={() => void onToggleReaction(m.id, r.emoji)}
                      onPointerDown={(e) => {
                        // Prevent bubbling into bubble long-press logic.
                        e.stopPropagation();
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onShowReactionDetails(r.emoji, r.userIds);
                      }}
                    >
                      {r.emoji} {r.count}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
