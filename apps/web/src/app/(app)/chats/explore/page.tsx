'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { useT } from '@/lib/i18n';

type DiscoverChannel = {
  id: string;
  title: string | null;
  avatarUrl: string | null;
  handle: string | null;
  description: string | null;
  memberCount: number;
  updatedAt: string;
};

export default function ExploreChannelsPage() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 280);

  const { data, isLoading } = useQuery({
    queryKey: ['discover-channels', debounced],
    queryFn: () =>
      apiFetch<DiscoverChannel[]>(
        `/chats/discover/channels${debounced.trim() ? `?q=${encodeURIComponent(debounced.trim())}` : ''}`,
      ),
  });

  const subscribe = useMutation({
    mutationFn: (channelId: string) =>
      apiFetch<{ id: string } & Record<string, unknown>>(`/chats/channels/${channelId}/subscribe`, {
        method: 'POST',
      }),
    onSuccess: (_res, channelId) => {
      void qc.invalidateQueries({ queryKey: ['chats'] });
      void qc.invalidateQueries({ queryKey: ['discover-channels'] });
      router.push(`/chats/${channelId}`);
    },
  });

  const rows = data ?? [];

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-lg flex-col px-4 py-6 text-white md:text-ink">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          href="/chats"
          className="text-sm text-sky-300 hover:text-sky-200 md:text-accent md:hover:underline"
        >
          ← {t('backToChats')}
        </Link>
        <Link
          href="/join"
          className="text-sm text-white/70 hover:text-white md:text-ink-muted md:hover:text-accent"
        >
          {t('searchJoinByGroupLink')}
        </Link>
        <Link
          href="/join/channel"
          className="text-sm text-white/70 hover:text-white md:text-ink-muted md:hover:text-accent"
        >
          {t('searchJoinByChannelLink')}
        </Link>
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-ink">
        {t('exploreChannelsTitle')}
      </h1>
      <p className="mt-2 text-sm text-white/60 md:text-ink-muted">{t('exploreChannelsSubtitle')}</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('exploreChannelsSearch')}
        className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400/50 md:border-line md:bg-surface-muted/40 md:text-ink md:placeholder:text-ink-muted"
      />

      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pb-8">
        {isLoading && (
          <p className="text-sm text-white/50 md:text-ink-muted">{t('commonLoading')}</p>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-white/55 md:text-ink-muted">{t('exploreChannelsEmpty')}</p>
        )}
        {rows.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#17212b]/80 px-3 py-3 md:border-line md:bg-surface-elevated"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{c.title ?? t('searchUntitled')}</span>
              {c.handle ? (
                <span className="truncate text-xs text-sky-300/90 md:text-accent">@{c.handle}</span>
              ) : null}
              <span className="text-[11px] text-white/45 md:text-ink-muted">
                {t('exploreMemberCount').replace('{{count}}', String(c.memberCount))}
              </span>
            </div>
            <button
              type="button"
              disabled={subscribe.isPending}
              onClick={() => subscribe.mutate(c.id)}
              className="shrink-0 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:opacity-50 md:bg-accent md:hover:brightness-110"
            >
              {t('exploreChannelsJoin')}
            </button>
          </div>
        ))}
      </div>
      {subscribe.isError && (
        <p className="text-center text-xs text-red-400 md:text-red-500">
          {t('exploreChannelsJoinFailed')}
        </p>
      )}
    </div>
  );
}
