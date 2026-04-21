'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { getOrCreateDirectChat } from '@/lib/direct-chat';
import { CreateGroupModal } from '@/components/pulse/create-group-modal';
import { CreateChannelModal } from '@/components/pulse/create-channel-modal';
import { useT } from '@/lib/i18n';
import { useDebouncedValue } from '@/lib/use-debounced-value';

export default function ComposePage() {
  const t = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const debounced = useDebouncedValue(q, 220);
  const needle = debounced.trim();
  const [groupOpen, setGroupOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);

  const { data, isFetching } = useQuery<{
    users: { id: string; username: string; displayName: string | null; avatarUrl: string | null }[];
  }>({
    queryKey: ['compose-search', needle],
    enabled: needle.length >= 2,
    queryFn: () => apiFetch(`/search?q=${encodeURIComponent(needle)}`),
  });

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/chats"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('chats')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('composeNewMessageTitle')}</span>
        <span className="w-10" />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-[#17212b]/85 p-3 md:border-line/70 md:bg-surface-elevated/80">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('composeSearchPlaceholder')}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 md:border-line md:bg-surface-muted/30 md:text-ink"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setGroupOpen(true)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            {t('createGroupTitle')}
          </button>
          <button
            type="button"
            onClick={() => setChannelOpen(true)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
          >
            {t('createChannelTitle')}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('people')}
          </h2>
        </div>
        <div className="px-2 pb-2">
          {needle.length < 2 ? (
            <p className="px-2 pb-2 text-sm text-white/55 md:text-ink-muted">{t('composeHint')}</p>
          ) : isFetching ? (
            <p className="px-2 pb-2 text-sm text-white/55 md:text-ink-muted">{t('searching')}</p>
          ) : users.length === 0 ? (
            <p className="px-2 pb-2 text-sm text-white/55 md:text-ink-muted">
              {t('composeNoResults')}
            </p>
          ) : (
            users.map((u) => {
              const name = u.displayName ?? u.username;
              return (
                <button
                  key={u.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.06]"
                  onClick={async () => {
                    const chat = await getOrCreateDirectChat(u.id);
                    void qc.invalidateQueries({ queryKey: ['chats'] });
                    router.push(`/chats/${chat.id}`);
                  }}
                >
                  <SafeAvatar
                    url={u.avatarUrl}
                    label={name.slice(0, 1).toUpperCase()}
                    className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/12"
                    fallbackClassName="text-sm font-semibold text-sky-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-white md:text-ink">
                      {name}
                    </div>
                    <div className="truncate text-xs text-white/50 md:text-ink-muted">
                      @{u.username}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <CreateGroupModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        onCreated={(id) => {
          setGroupOpen(false);
          router.push(`/chats/${id}`);
        }}
      />
      <CreateChannelModal
        open={channelOpen}
        onClose={() => setChannelOpen(false)}
        onCreated={(id) => {
          setChannelOpen(false);
          router.push(`/chats/${id}`);
        }}
      />
    </div>
  );
}
