'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { toPublicUrl } from '@/lib/api';
import { useT, type I18nKey } from '@/lib/i18n';
import { directChatPresenceSubtitle } from '@/lib/format-last-seen';
import { useLanguageStore } from '@/stores/language-store';

export type ChatDetailForDrawer = {
  id: string;
  type: string;
  title: string | null;
  avatarUrl: string | null;
  isPrivate?: boolean;
  role?: string;
  peer?: {
    id: string;
    displayName: string | null;
    username: string;
    avatarUrl: string | null;
    lastSeenAt?: string | null;
    isOnline?: boolean;
    lastSeenVisible?: boolean;
  } | null;
  pinnedMessage?: {
    id: string;
    text: string | null;
    senderId: string | null;
    createdAt: string;
    deletedAt: string | null;
    sender?: { id: string; username: string; displayName: string | null } | null;
  } | null;
  members?: {
    userId: string;
    role: string;
    user: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }[];
};

function typeLabel(type: string | undefined, t: (k: I18nKey) => string): string {
  switch (type) {
    case 'DIRECT':
      return t('directMessage');
    case 'GROUP':
      return t('group');
    case 'CHANNEL':
      return t('channel');
    case 'SAVED':
      return t('savedMessagesLong');
    default:
      return type ?? t('chatFallback');
  }
}

function PlaceholderSection({ title, hint }: { title: string; hint: string }) {
  return (
    <section className="rounded-xl border border-line/55 bg-surface-muted/25 px-3 py-3 dark:border-line/40 dark:bg-surface-muted/15">
      <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-muted">
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-snug text-ink-muted/90">{hint}</p>
    </section>
  );
}

export function ChatDetailsDrawer({
  open,
  onClose,
  chat,
}: {
  open: boolean;
  onClose: () => void;
  chat: ChatDetailForDrawer | undefined;
}) {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const isDirect = chat?.type === 'DIRECT';
  const displayName =
    chat?.peer?.displayName ?? chat?.title ?? chat?.peer?.username ?? t('conversationFallback');
  const username = chat?.peer?.username;
  const avatarSrc = isDirect ? (chat?.peer?.avatarUrl ?? chat?.avatarUrl) : chat?.avatarUrl;
  const avatarPublicSrc = toPublicUrl(avatarSrc);
  const peerId = chat?.peer?.id;
  const status = isDirect && chat?.peer ? directChatPresenceSubtitle(chat.peer, t, language) : null;
  const initial = displayName.slice(0, 1).toUpperCase() || '?';

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-ink/25 backdrop-blur-[2px] dark:bg-black/45"
        aria-label={t('drawerCloseInfo')}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[101] flex h-[100dvh] max-h-[100dvh] w-full max-w-[22rem] flex-col border-l border-line/80 bg-surface-elevated shadow-[0_0_40px_rgba(0,0,0,0.12)]',
          'max-md:max-w-none dark:border-line/50 dark:bg-surface-elevated/98 dark:shadow-[0_0_48px_rgba(0,0,0,0.45)]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-details-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line/70 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-line/45">
          <h2 id="chat-details-title" className="font-display text-lg font-semibold text-ink">
            {t('drawerChatInfo')}
          </h2>
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink md:min-h-0 md:min-w-0 md:p-2"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-[max(1.25rem,calc(1rem+env(safe-area-inset-bottom)))]">
          {isDirect ? (
            <div className="flex flex-col items-center text-center">
              <Link
                href={peerId ? `/users/${peerId}` : '#'}
                onClick={() => {
                  if (!peerId) return;
                  onClose();
                }}
                className={cn(
                  'group flex flex-col items-center text-center',
                  !peerId && 'pointer-events-none',
                )}
                aria-label={t('openProfileAria')}
              >
                <div className="relative h-[4.5rem] w-[4.5rem] shrink-0">
                  {avatarPublicSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPublicSrc}
                      alt=""
                      className="h-full w-full rounded-full object-cover ring-2 ring-line/40 transition group-hover:ring-accent/35 dark:ring-line/35"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex h-full w-full items-center justify-center rounded-full text-2xl font-semibold ring-2 ring-line/35 transition group-hover:ring-accent/35',
                        'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                      )}
                    >
                      {initial}
                    </div>
                  )}
                </div>
                <p className="mt-4 font-display text-lg font-semibold leading-tight text-ink">
                  {displayName}
                </p>
                {username ? <p className="mt-1 text-sm text-ink-muted">@{username}</p> : null}
                {status ? <p className="mt-1 text-sm text-ink-muted">{status}</p> : null}
                <p className="mt-2 text-xs font-semibold text-accent opacity-0 transition group-hover:opacity-100">
                  {t('drawerViewProfile')}
                </p>
              </Link>
              <p className="mt-3 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25">
                {typeLabel(chat?.type, t)}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex justify-center">
                <div className="relative h-16 w-16 shrink-0">
                  {avatarPublicSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPublicSrc}
                      alt=""
                      className="h-full w-full rounded-2xl object-cover ring-2 ring-line/40 dark:ring-line/35"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex h-full w-full items-center justify-center rounded-2xl text-xl font-semibold ring-2 ring-line/35',
                        'bg-gradient-to-br from-accent/35 to-accent/10 text-accent dark:from-accent/28 dark:to-accent/5',
                      )}
                    >
                      {(chat?.title ?? '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 text-center font-display text-lg font-semibold text-ink">
                {chat?.title ?? typeLabel(chat?.type, t)}
              </p>
              <p className="mt-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
                {typeLabel(chat?.type, t)}
              </p>
              {chat?.role && (
                <p className="mt-4 text-center text-sm text-ink-muted">
                  {t('drawerYourRole')} <span className="font-medium text-ink">{chat.role}</span>
                </p>
              )}
            </div>
          )}

          {!isDirect && chat?.members && chat.members.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {t('drawerMembers')} ({chat.members.length})
              </p>
              <ul className="mt-2 space-y-2">
                {chat.members.map((m) => (
                  <li
                    key={m.userId}
                    className="flex items-center gap-2 rounded-lg border border-line/60 px-2 py-2 text-sm dark:border-line/45"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">
                      {m.user.displayName ?? m.user.username}
                    </span>
                    <span className="shrink-0 text-2xs uppercase text-ink-muted">{m.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isDirect && chat?.role && (
            <p className="mt-8 text-center text-sm text-ink-muted">
              {t('drawerYourRole')} <span className="font-medium text-ink">{chat.role}</span>
            </p>
          )}

          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t('drawerShared')}
            </p>
            <PlaceholderSection title={t('drawerMedia')} hint={t('drawerMediaHint')} />
            <PlaceholderSection title={t('drawerFiles')} hint={t('drawerFilesHint')} />
            <PlaceholderSection title={t('drawerLinks')} hint={t('drawerLinksHint')} />
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
