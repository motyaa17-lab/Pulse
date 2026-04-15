'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';

type PublicUserDto = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

function statusLabel(u: PublicUserDto | undefined): string {
  if (!u) return '';
  if (u.isOnline) return 'Online';
  if (u.lastSeenAt) return 'Last seen recently';
  return 'Offline';
}

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiFetch<PublicUserDto>(`/users/${userId}`),
  });

  const title = user?.displayName ?? user?.username ?? (isLoading ? 'Loading…' : 'User');
  const initial = title.slice(0, 1).toUpperCase() || '?';

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/chats" className="text-sm text-accent">
        ← Back to chats
      </Link>

      <section className="mt-6 rounded-2xl border border-line bg-surface-elevated p-5">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-line/45"
              />
            ) : (
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ring-1 ring-line/40',
                  'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                )}
              >
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-semibold text-ink">{title}</h1>
            <p className="mt-0.5 truncate text-sm text-ink-muted">@{user?.username ?? '—'}</p>
            <p className="mt-2 inline-flex rounded-full border border-line/70 bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted dark:border-line/45 dark:bg-surface-muted/25">
              {statusLabel(user)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">About</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {user?.bio?.trim() ? user.bio : <span className="text-ink-muted">No bio yet.</span>}
          </p>
        </div>
      </section>
    </div>
  );
}

