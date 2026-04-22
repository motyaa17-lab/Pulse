'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  const [moreOpen, setMoreOpen] = useState(false);

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
        <ActionButton label={t('profileCall')} icon="call" />
        <ActionButton label={t('profileVideo')} icon="video" />
        <ActionButton label={t('profileMute')} icon="mute" />
        <ActionButton label={t('profileSearch')} icon="search" />
        <ActionButton label={t('profileMore')} icon="more" onClick={() => setMoreOpen(true)} />
      </div>

      <div className="mt-5">
        <TgCard className="mt-4">
          <div className="px-4 py-3 text-[13px] text-ink-muted dark:text-white/60">
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-red-500">
              !
            </span>
            {t('profileUnofficialClientWarning')}
          </div>
        </TgCard>

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
                icon="🖼️"
                label={t('profileMenuChangeWallpaper')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="🔒"
                label={t('profileMenuSecretChat')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="⏱️"
                label={t('profileMenuAutoDelete')}
                onClick={() => setMoreOpen(false)}
              />
              <div className="h-px bg-line/60 dark:bg-white/[0.10]" />
              <MenuItem
                icon="🚫"
                label={t('profileMenuRestrict')}
                onClick={() => setMoreOpen(false)}
              />
              <MenuItem
                icon="🗑️"
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
}: {
  label: string;
  icon: 'call' | 'video' | 'mute' | 'search' | 'more';
  onClick?: () => void;
}) {
  const glyph =
    icon === 'call'
      ? '📞'
      : icon === 'video'
        ? '📹'
        : icon === 'mute'
          ? '🔕'
          : icon === 'search'
            ? '🔎'
            : '⋯';
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[74px] flex-col items-center gap-2 rounded-2xl bg-surface-muted/35 px-2 py-3 text-ink dark:bg-white/[0.06] dark:text-white"
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-elevated text-[18px] ring-1 ring-line/60 dark:bg-white/[0.10] dark:ring-white/[0.10]">
        {glyph}
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
  icon: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
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
      <span className="w-6 text-center text-[16px] opacity-80">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
