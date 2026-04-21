'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

type BanList = {
  items: {
    user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
    bannedAt: string;
    reason: string | null;
  }[];
};

export default function GroupBansPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const t = useT();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [reason, setReason] = useState('');

  const { data: chat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
  });

  const { data: bans, isLoading } = useQuery({
    queryKey: ['chat-bans', chatId],
    queryFn: () => apiFetch<BanList>(`/chats/${chatId}/bans`),
  });

  const bannedIds = useMemo(
    () => new Set((bans?.items ?? []).map((x) => x.user.id)),
    [bans?.items],
  );

  const candidates = useMemo(() => {
    const list = chat?.members ?? [];
    const needle = q.trim().toLowerCase();
    const filtered = list.filter((m) => {
      const id = m.user.id ?? m.userId;
      if (bannedIds.has(id)) return false;
      if (m.role === 'OWNER') return false;
      if (!needle) return true;
      const name = (m.user.displayName ?? m.user.username ?? '').toLowerCase();
      const uname = (m.user.username ?? '').toLowerCase();
      return name.includes(needle) || uname.includes(needle);
    });
    return filtered.slice(0, 20);
  }, [bannedIds, chat?.members, q]);

  const ban = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/bans/${userId}`, {
        method: 'POST',
        body: { reason: reason.trim() || undefined },
      }),
    onSuccess: () => {
      setQ('');
      setReason('');
      void qc.invalidateQueries({ queryKey: ['chat-bans', chatId] });
      void qc.invalidateQueries({ queryKey: ['chat', chatId] });
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const unban = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/bans/${userId}/unban`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat-bans', chatId] });
    },
  });

  if (isLoading && !bans) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/60 md:text-ink-muted">
        {t('commonLoading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href={`/chats/${chatId}/group`}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          {t('groupSettingsBackToGroupSettings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('groupSettingsBansTitle')}</span>
        <span className="w-10" />
      </div>

      <p className="mt-3 text-sm text-white/55 md:text-ink-muted">
        {t('groupSettingsBansSubtitle')}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('groupSettingsBanUser')}
          </h2>
        </div>
        <div className="px-4 pb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('groupSettingsBanSearchPlaceholder')}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 md:border-line md:bg-surface-muted/30 md:text-ink"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('groupSettingsBanReasonPlaceholder')}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-sky-400/50 md:border-line md:bg-surface-muted/30 md:text-ink"
          />
          {q.trim() && candidates.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 md:border-line/50">
              {candidates.map((m) => {
                const uid = m.user.id ?? m.userId;
                const name = m.user.displayName ?? m.user.username;
                return (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => ban.mutate(uid)}
                    disabled={ban.isPending}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    <SafeAvatar
                      url={m.user.avatarUrl ?? null}
                      label={name.slice(0, 1).toUpperCase()}
                      className="h-9 w-9 shrink-0 rounded-full ring-1 ring-white/15"
                      fallbackClassName="text-xs font-semibold text-sky-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-white md:text-ink">
                        {name}
                      </div>
                      <div className="truncate text-xs text-white/50 md:text-ink-muted">
                        @{m.user.username}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold',
                        'border-red-400/40 bg-red-500/10 text-red-200',
                      )}
                    >
                      {t('groupSettingsBanUser')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('groupSettingsBansTitle')}
          </h2>
        </div>
        <ul className="divide-y divide-white/10 md:divide-line/50">
          {(bans?.items ?? []).length === 0 ? (
            <li className="px-4 pb-4 text-sm text-white/55 md:text-ink-muted">
              {t('groupSettingsNoBans')}
            </li>
          ) : (
            (bans?.items ?? []).map((b) => {
              const name = b.user.displayName ?? b.user.username;
              return (
                <li key={b.user.id} className="flex items-center gap-3 px-4 py-3">
                  <SafeAvatar
                    url={b.user.avatarUrl}
                    label={name.slice(0, 1).toUpperCase()}
                    className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/15"
                    fallbackClassName="text-sm font-semibold text-sky-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-white md:text-ink">
                      {name}
                    </div>
                    <div className="truncate text-xs text-white/50 md:text-ink-muted">
                      @{b.user.username}
                    </div>
                    {b.reason ? (
                      <div className="mt-0.5 truncate text-xs text-white/45 md:text-ink-muted">
                        {b.reason}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={unban.isPending}
                    onClick={() => unban.mutate(b.user.id)}
                    className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50 md:border-line/60"
                  >
                    {t('groupSettingsUnbanUser')}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
