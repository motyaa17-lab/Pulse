'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiFetch, toPublicUrl } from '@/lib/api';
import { useT, type I18nKey } from '@/lib/i18n';
import { directChatPresenceSubtitle, type PresencePeer } from '@/lib/format-last-seen';
import { useLanguageStore } from '@/stores/language-store';
import { cn } from '@/lib/cn';
import { TgCard, TgChevron, TgNav, TgPage, TgRow } from '@/components/telegram/telegram-ui';

type PublicUserDto = PresencePeer & {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

function statusLabel(
  u: PublicUserDto | undefined,
  t: (k: I18nKey) => string,
  lang: 'ru' | 'en',
): string {
  if (!u) return '';
  return directChatPresenceSubtitle(u, t, lang);
}

export default function UserProfilePage() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [busy, setBusy] = useState<null | 'call' | 'video' | 'mute' | 'search'>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiFetch<PublicUserDto>(`/users/${userId}`),
  });

  const title =
    user?.displayName ??
    user?.username ??
    (isLoading ? t('commonLoading') : t('publicUserFallback'));
  const initial = title.slice(0, 1).toUpperCase() || '?';
  const avatarSrc = toPublicUrl(user?.avatarUrl ?? null) ?? null;
  const username = user?.username ? `@${user.username}` : `@${t('profileDash')}`;
  const status = statusLabel(user, t, language);

  const tabs = useMemo(() => {
    // Telegram iOS: this area is dynamic (media / files / voice / links / gifts).
    // We keep it minimal for now (no gifts requested).
    return [
      { id: 'media', label: t('drawerMedia') },
      { id: 'music', label: t('musicTab') },
      { id: 'voice', label: t('voiceTab') },
    ] as const;
  }, [t]);
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('media');

  const ensureDirectChat = async (): Promise<string> => {
    const chat = await apiFetch<{ id: string }>(`/chats/direct`, {
      method: 'POST',
      body: { peerUserId: userId },
    });
    return chat.id;
  };

  const toggleMute = async () => {
    const chatId = await ensureDirectChat();
    const until = muted ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    await apiFetch(`/chats/${chatId}/mute`, { method: 'POST', body: { until } });
    setMuted(!muted);
  };

  return (
    <TgPage className="max-w-lg">
      <TgNav title="" backHref="/chats" backLabel={t('backToChatsLink')} />

      <div className="mt-2 flex flex-col items-center text-center">
        <div className="relative h-28 w-28 shrink-0">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt="" className="h-28 w-28 rounded-full object-cover" />
          ) : (
            <div className="grid h-28 w-28 place-items-center rounded-full bg-surface-muted/50 text-4xl font-semibold text-ink dark:bg-white/[0.08] dark:text-white">
              {initial}
            </div>
          )}
        </div>
        <h1 className="mt-4 font-display text-[2rem] font-semibold leading-tight text-ink dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-[15px] text-ink-muted dark:text-white/55">{status}</p>
      </div>

      <div className="mt-5 flex w-full items-center justify-center gap-2">
        <ActionButton
          label={t('profileCall')}
          icon="call"
          loading={busy === 'call'}
          onClick={() => {
            void (async () => {
              setBusy('call');
              try {
                await ensureDirectChat();
                router.push('/calls');
              } finally {
                setBusy(null);
              }
            })();
          }}
        />
        <ActionButton
          label={t('profileVideo')}
          icon="video"
          loading={busy === 'video'}
          onClick={() => {
            void (async () => {
              setBusy('video');
              try {
                await ensureDirectChat();
                router.push('/calls');
              } finally {
                setBusy(null);
              }
            })();
          }}
        />
        <ActionButton
          label={t('profileMute')}
          icon="mute"
          active={muted}
          loading={busy === 'mute'}
          onClick={() => {
            void (async () => {
              setBusy('mute');
              try {
                await toggleMute();
              } finally {
                setBusy(null);
              }
            })();
          }}
        />
        <ActionButton
          label={t('profileSearch')}
          icon="search"
          loading={busy === 'search'}
          onClick={() => {
            void (async () => {
              setBusy('search');
              try {
                const chatId = await ensureDirectChat();
                router.push(`/chats/${chatId}?search=1`);
              } finally {
                setBusy(null);
              }
            })();
          }}
        />
        <ActionButton label={t('profileMore')} icon="more" onClick={() => setMoreOpen(true)} />
      </div>

      <div className="mt-5">
        <TgCard className="mt-4">
          <TgRow>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-muted">{t('profileUsername')}</div>
              <div className="mt-1 text-[17px] font-semibold text-ink dark:text-white">
                {username}
              </div>
            </div>
            <TgChevron />
          </TgRow>
          <TgRow onClick={() => {}}>
            <div className="min-w-0 flex-1 text-[17px] font-semibold text-accent">
              {t('profileAddToContacts')}
            </div>
          </TgRow>
          <TgRow onClick={() => {}} className="text-red-600 dark:text-red-400">
            <div className="min-w-0 flex-1 text-[17px] font-semibold">{t('profileBlockUser')}</div>
          </TgRow>
        </TgCard>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-[15px] font-semibold',
                tab === x.id
                  ? 'bg-surface-elevated text-ink shadow-sm ring-1 ring-line/60 dark:bg-white/10 dark:text-white dark:ring-white/10'
                  : 'bg-surface-muted/40 text-ink-muted dark:bg-white/[0.06] dark:text-white/55',
              )}
            >
              {x.label}
            </button>
          ))}
        </div>

        <TgCard className="mt-3">
          <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-4">
            {/* Placeholder thumbnails for now; real shared media comes later. */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-surface-muted/40 dark:bg-white/[0.06]"
              />
            ))}
          </div>
        </TgCard>

        <TgCard title={t('publicUserAbout')} className="mt-6">
          <div className="px-4 pb-4 text-[15px] leading-relaxed text-ink dark:text-white">
            {user?.bio?.trim() ? (
              user.bio
            ) : (
              <span className="text-ink-muted">{t('publicUserNoBio')}</span>
            )}
          </div>
        </TgCard>
      </div>

      {moreOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[250] bg-ink/25 backdrop-blur-[2px] dark:bg-black/45"
            aria-label={t('close')}
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[251] mx-auto w-full max-w-lg px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="overflow-hidden rounded-2xl bg-surface-elevated shadow-[0_14px_50px_rgba(0,0,0,0.22)] ring-1 ring-line/70 dark:bg-[rgb(var(--tg-panel))] dark:ring-white/[0.10]">
              <MenuItem
                icon="wallpaper"
                label={t('profileMenuChangeWallpaper')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="lock"
                label={t('profileMenuSecretChat')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="timer"
                label={t('profileMenuAutoDelete')}
                onClick={() => setMoreOpen(false)}
              />
              <div className="h-px bg-line/60 dark:bg-white/[0.10]" />
              <MenuItem
                icon="restrict"
                label={t('profileMenuRestrict')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="trash"
                label={t('profileMenuDeleteChat')}
                danger
                onClick={() => setMoreOpen(false)}
              />
            </div>
          </div>
        </>
      ) : null}
    </TgPage>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  active,
  loading,
}: {
  label: string;
  icon: 'call' | 'video' | 'mute' | 'search' | 'more';
  onClick?: () => void;
  active?: boolean;
  loading?: boolean;
}) {
  const Icon =
    icon === 'call'
      ? PhoneIcon
      : icon === 'video'
        ? VideoIcon
        : icon === 'mute'
          ? BellOffIcon
          : icon === 'search'
            ? SearchIcon
            : MoreIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex w-[74px] flex-col items-center gap-2 rounded-2xl bg-surface-muted/35 px-2 py-3 text-ink transition disabled:opacity-60 dark:bg-white/[0.06] dark:text-white',
        active && 'bg-accent/10',
      )}
    >
      <div
        className={cn(
          'grid h-11 w-11 place-items-center rounded-2xl bg-surface-elevated ring-1 ring-line/60 dark:bg-white/[0.10] dark:ring-white/[0.10]',
          active && 'ring-accent/30',
        )}
      >
        <Icon
          className={cn('h-5 w-5', active ? 'text-accent' : 'text-ink-muted dark:text-white/70')}
        />
      </div>
      <div className="text-[12px] font-semibold text-ink-muted dark:text-white/55">{label}</div>
    </button>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: 'wallpaper' | 'lock' | 'timer' | 'restrict' | 'trash';
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  const Icon =
    icon === 'wallpaper'
      ? WallpaperIcon
      : icon === 'lock'
        ? LockIcon
        : icon === 'timer'
          ? TimerIcon
          : icon === 'restrict'
            ? RestrictIcon
            : TrashIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left text-[16px] font-semibold',
        danger ? 'text-red-600 dark:text-red-400' : 'text-ink dark:text-white',
        'hover:bg-surface-muted/50 dark:hover:bg-white/[0.06]',
      )}
    >
      <span className="grid h-7 w-7 place-items-center">
        <Icon
          className={cn(
            'h-5 w-5',
            danger ? 'text-red-600 dark:text-red-400' : 'text-ink-muted dark:text-white/70',
          )}
        />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.1 10.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 10l4.55-2.28A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.45.9L15 14V10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="3" y="7" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function BellOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 18a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M18 8a6 6 0 0 0-9.33-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.26 6.26A6 6 0 0 0 6 8c0 7-3 7-3 7h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h.01M12 12h.01M19 12h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
function WallpaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 14l3-3 4 4 3-3 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.5 9.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14l3-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function RestrictIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 16.5l9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
