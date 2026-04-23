'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { useT, type I18nKey } from '@/lib/i18n';
import { directChatPresenceSubtitle } from '@/lib/format-last-seen';
import { useLanguageStore } from '@/stores/language-store';
import { apiFetch, toPublicUrl } from '@/lib/api';
import { AddMemberModal } from '@/components/pulse/add-member-modal';
import { tgFadeIn, tgSheetPop, useReduceMotion } from '@/lib/motion';

type InfoTab = 'members' | 'media' | 'files' | 'links';

type SharedMediaItem = {
  id: string;
  kind: string;
  url: string;
  mimeType: string;
  fileName: string;
  messageId: string;
  createdAt: string;
};

type SharedMediaResponse = { items: SharedMediaItem[] };

export type ChatDetailForDrawer = {
  id: string;
  type: string;
  title: string | null;
  avatarUrl: string | null;
  isPrivate?: boolean;
  role?: string;
  group?: {
    description: string | null;
    onlyAdminsCanAddMembers?: boolean;
    inviteEnabled?: boolean;
    inviteSlug?: string | null;
  } | null;
  channel?: {
    handle: string | null;
    description: string | null;
    inviteSlug?: string | null;
    inviteEnabled?: boolean;
  } | null;
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
      id?: string;
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

function Segmented({
  tab,
  setTab,
  t,
  membersCount,
}: {
  tab: InfoTab;
  setTab: (t: InfoTab) => void;
  t: (k: I18nKey) => string;
  membersCount: number;
}) {
  const items: { id: InfoTab; label: string }[] = [
    { id: 'members', label: `${t('drawerMembers')}${membersCount ? ` (${membersCount})` : ''}` },
    { id: 'media', label: t('drawerMedia') },
    { id: 'files', label: t('drawerFiles') },
    { id: 'links', label: t('drawerLinks') },
  ];
  return (
    <div className="mt-5 flex justify-center">
      <div className="relative flex w-full max-w-[26rem] items-center rounded-xl bg-surface-muted/70 p-1 ring-1 ring-line/60 dark:bg-white/[0.08] dark:ring-white/[0.10]">
        <div
          aria-hidden
          className={cn(
            'absolute bottom-1 top-1 rounded-[0.65rem] bg-surface-elevated shadow-sm transition-[left,width] duration-200 ease-out dark:bg-white/15',
            tab === 'members'
              ? 'left-1 w-[calc(25%-0.5rem)]'
              : tab === 'media'
                ? 'left-[calc(25%+0.25rem)] w-[calc(25%-0.5rem)]'
                : tab === 'files'
                  ? 'left-[calc(50%+0.25rem)] w-[calc(25%-0.5rem)]'
                  : 'left-[calc(75%+0.25rem)] w-[calc(25%-0.5rem)]',
          )}
        />
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setTab(it.id)}
            className={cn(
              'relative z-[1] flex-1 rounded-[0.65rem] px-2 py-2 text-[13px] font-semibold transition',
              tab === it.id ? 'text-ink dark:text-white' : 'text-ink-muted dark:text-white/70',
            )}
            aria-pressed={tab === it.id}
          >
            <span className="block truncate">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
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
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [tab, setTab] = useState<InfoTab>('members');
  const t = useT();
  const reduceMotion = useReduceMotion();
  const language = useLanguageStore((s) => s.language);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const chatId = chat?.id;
  const { data: sharedMedia, isPending: sharedMediaPending } = useQuery<SharedMediaResponse>({
    queryKey: ['chat', chatId ?? '', 'shared-media'],
    queryFn: async (): Promise<SharedMediaResponse> => {
      if (!chatId) return { items: [] };
      return apiFetch<SharedMediaResponse>(`/chats/${chatId}/shared-media`);
    },
    enabled: open && Boolean(chatId),
    staleTime: 30_000,
  });
  const sharedMediaItems = sharedMedia?.items ?? [];
  const showSharedMediaLoading = sharedMediaPending && sharedMediaItems.length === 0;
  const showSharedMediaGrid = sharedMediaItems.length > 0;

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

  const existingMemberIds = useMemo(() => {
    const s = new Set<string>();
    for (const m of chat?.members ?? []) s.add(m.userId);
    return s;
  }, [chat?.members]);

  if (!open || typeof document === 'undefined') return null;

  const isDirect = chat?.type === 'DIRECT';
  const displayName =
    chat?.peer?.displayName ?? chat?.title ?? chat?.peer?.username ?? t('conversationFallback');
  const username = chat?.peer?.username;
  const avatarSrc = isDirect ? (chat?.peer?.avatarUrl ?? chat?.avatarUrl) : chat?.avatarUrl;
  const peerId = chat?.peer?.id;
  const status = isDirect && chat?.peer ? directChatPresenceSubtitle(chat.peer, t, language) : null;
  const initial = displayName.slice(0, 1).toUpperCase() || '?';

  const canManageMembers = Boolean(
    chat &&
    !isDirect &&
    (chat.role === 'OWNER' ||
      chat.role === 'ADMIN' ||
      (chat.type === 'GROUP' && chat.role === 'MEMBER' && !chat.group?.onlyAdminsCanAddMembers)),
  );

  const groupDesc = chat?.type === 'GROUP' ? chat.group?.description : null;
  const channelMeta = chat?.type === 'CHANNEL' ? chat.channel : null;

  return createPortal(
    <>
      <motion.button
        type="button"
        className="fixed inset-0 z-[100] bg-ink/25 backdrop-blur-[2px] dark:bg-black/45"
        aria-label={t('drawerCloseInfo')}
        onClick={onClose}
        {...tgFadeIn(reduceMotion)}
      />
      <motion.aside
        className={cn(
          // Desktop: right drawer. Mobile: full-screen info screen (Telegram iOS-like).
          'fixed z-[101] flex w-full flex-col bg-surface-elevated shadow-[0_0_40px_rgba(0,0,0,0.12)]',
          'max-md:inset-0 max-md:h-[100svh] max-md:max-h-[100svh]',
          'md:inset-y-0 md:right-0 md:h-[100svh] md:max-h-[100svh] md:max-w-[22rem] md:border-l md:border-line/80',
          'dark:bg-surface-elevated/98 dark:shadow-[0_0_48px_rgba(0,0,0,0.45)] dark:md:border-line/50',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-details-title"
        onClick={(e) => e.stopPropagation()}
        {...tgSheetPop(reduceMotion)}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line/70 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-line/45">
          <h2
            id="chat-details-title"
            className="font-display text-lg font-semibold text-ink dark:text-white"
          >
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

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-[max(1.25rem,calc(5rem+env(safe-area-inset-bottom)))]">
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
                  <SafeAvatar
                    url={avatarSrc}
                    label={initial}
                    className="h-full w-full rounded-full ring-2 ring-line/40 transition group-hover:ring-accent/35 dark:ring-line/35"
                    fallbackClassName="bg-gradient-to-br from-accent/35 to-accent/10 text-2xl text-accent ring-2 ring-line/35 transition group-hover:ring-accent/35 dark:from-accent/28 dark:to-accent/5"
                  />
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
                  <SafeAvatar
                    url={avatarSrc}
                    label={(chat?.title ?? '?').slice(0, 1)}
                    className="h-full w-full rounded-2xl ring-2 ring-line/40 dark:ring-line/35"
                    imgClassName="rounded-2xl"
                    fallbackClassName="rounded-2xl bg-gradient-to-br from-accent/35 to-accent/10 text-xl text-accent ring-2 ring-line/35 dark:from-accent/28 dark:to-accent/5"
                  />
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
              {chat?.type === 'CHANNEL' && (
                <p className="mt-2 text-center text-[11px] text-ink-muted">
                  {chat.isPrivate ? t('drawerChannelPrivate') : t('drawerChannelPublic')}
                </p>
              )}
              {channelMeta?.handle ? (
                <p className="mt-1 text-center text-sm text-accent">@{channelMeta.handle}</p>
              ) : null}
              {(groupDesc || channelMeta?.description)?.trim() ? (
                <p className="mt-3 px-1 text-center text-sm leading-relaxed text-ink-muted">
                  {(groupDesc || channelMeta?.description || '').trim()}
                </p>
              ) : null}
              {canManageMembers && chat?.id && (
                <button
                  type="button"
                  className="mx-auto mt-4 block rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                  onClick={() => setAddMemberOpen(true)}
                >
                  {t('drawerAddMembers')}
                </button>
              )}
              {/* Prevent accidental navigation on mobile: settings are opened explicitly from the chat header. */}
            </div>
          )}

          {!isDirect ? (
            <>
              <Segmented
                tab={tab}
                setTab={setTab}
                t={t}
                membersCount={chat?.members?.length ?? 0}
              />

              {tab === 'members' ? (
                <div className="mt-6">
                  {(chat?.members ?? []).length > 0 ? (
                    <ul className="divide-y divide-line/50 overflow-hidden rounded-2xl border border-line/60 bg-surface-elevated/70 dark:divide-white/[0.10] dark:border-white/[0.10] dark:bg-[rgb(var(--tg-panel))]/55">
                      {(chat?.members ?? []).map((m) => {
                        const uid = m.user.id ?? m.userId;
                        const label = m.user.displayName ?? m.user.username;
                        return (
                          <li key={m.userId}>
                            {uid ? (
                              <Link
                                href={`/users/${uid}`}
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 text-[15px] text-ink transition hover:bg-surface-muted/60 dark:text-white dark:hover:bg-white/[0.06]"
                              >
                                <span className="min-w-0 flex-1 truncate font-semibold">
                                  {label}
                                </span>
                                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted dark:text-white/45">
                                  {m.role}
                                </span>
                              </Link>
                            ) : (
                              <div className="flex items-center gap-3 px-4 py-3 text-[15px] text-ink dark:text-white">
                                <span className="min-w-0 flex-1 truncate font-semibold">
                                  {label}
                                </span>
                                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted dark:text-white/45">
                                  {m.role}
                                </span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <PlaceholderSection title={t('drawerMembers')} hint={t('drawerMembersHint')} />
                  )}
                </div>
              ) : tab === 'media' ? (
                <div className="mt-6">
                  {showSharedMediaLoading ? (
                    <PlaceholderSection title={t('drawerMedia')} hint={t('commonLoading')} />
                  ) : showSharedMediaGrid ? (
                    <section className="overflow-hidden rounded-2xl border border-line/60 bg-surface-elevated/70 p-3 dark:border-white/[0.10] dark:bg-[rgb(var(--tg-panel))]/55">
                      <div className="grid grid-cols-3 gap-1.5">
                        {sharedMediaItems
                          .filter(
                            (x) =>
                              x.kind === 'image' ||
                              x.kind === 'video' ||
                              x.mimeType.startsWith('image/') ||
                              x.mimeType.startsWith('video/'),
                          )
                          .map((it) => {
                            const pub = toPublicUrl(it.url) ?? it.url;
                            const isVideo = it.kind === 'video' || it.mimeType.startsWith('video/');
                            return (
                              <div
                                key={it.id}
                                className="relative aspect-square overflow-hidden rounded-lg bg-black/5 ring-1 ring-line/30 dark:bg-black/25 dark:ring-white/10"
                              >
                                {isVideo ? (
                                  <>
                                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                    <video
                                      src={pub}
                                      className="h-full w-full object-cover"
                                      muted
                                      playsInline
                                      preload="metadata"
                                    />
                                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                                      <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-white/95 drop-shadow"
                                        aria-hidden
                                      >
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </span>
                                  </>
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={pub}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </section>
                  ) : (
                    <PlaceholderSection title={t('drawerMedia')} hint={t('drawerMediaHint')} />
                  )}
                </div>
              ) : tab === 'files' ? (
                <div className="mt-6">
                  <PlaceholderSection title={t('drawerFiles')} hint={t('drawerFilesHint')} />
                </div>
              ) : (
                <div className="mt-6">
                  <PlaceholderSection title={t('drawerLinks')} hint={t('drawerLinksHint')} />
                </div>
              )}
            </>
          ) : null}

          {isDirect && chat?.role && (
            <p className="mt-8 text-center text-sm text-ink-muted">
              {t('drawerYourRole')} <span className="font-medium text-ink">{chat.role}</span>
            </p>
          )}

          {/* Shared content moved into segmented tabs above (Telegram iOS-like). */}
        </div>
      </motion.aside>
      {chat?.id ? (
        <AddMemberModal
          open={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          chatId={chat.id}
          existingUserIds={existingMemberIds}
        />
      ) : null}
    </>,
    document.body,
  );
}
