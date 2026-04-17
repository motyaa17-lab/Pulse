'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, toPublicUrl } from '@/lib/api';
import { useT, type I18nKey } from '@/lib/i18n';

type PublicUserDto = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

function statusLabel(u: PublicUserDto | undefined, t: (k: I18nKey) => string): string {
  if (!u) return '';
  if (u.isOnline) return t('online');
  if (u.lastSeenAt) return t('lastSeenRecently');
  return t('offline');
}

export default function UserProfilePage() {
  const t = useT();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiFetch<PublicUserDto>(`/users/${userId}`),
  });

  const title =
    user?.displayName ??
    user?.username ??
    (isLoading ? t('commonLoading') : t('publicUserFallback'));
  const initial = title.slice(0, 1).toUpperCase() || '?';

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/chats" className="text-sm text-accent">
        {t('backToChatsLink')}
      </Link>

      <section className="mt-6 rounded-2xl border border-line bg-surface-elevated p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicUrl(user.avatarUrl) ?? '/default-avatar.png'}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-line/45"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/default-avatar.png"
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-line/45"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-semibold text-ink">{title}</h1>
            <p className="mt-0.5 truncate text-sm text-ink-muted">
              @{user?.username ?? t('profileDash')}
            </p>
            <p className="mt-2 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25">
              {statusLabel(user, t)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {t('publicUserAbout')}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {user?.bio?.trim() ? (
              user.bio
            ) : (
              <span className="text-ink-muted">{t('publicUserNoBio')}</span>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
