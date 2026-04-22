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
import { TgCard, TgNav, TgPage, TgRow } from '@/components/telegram/telegram-ui';

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
    <TgPage className="max-w-lg">
      <TgNav
        title={t('groupSettingsBansTitle')}
        backHref={`/chats/${chatId}/group`}
        backLabel={t('groupSettingsBackToGroupSettings')}
      />

      <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">
        {t('groupSettingsBansSubtitle')}
      </p>

      <TgCard title={t('groupSettingsBanUser')} className="mt-4">
        <div className="px-4 pb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('groupSettingsBanSearchPlaceholder')}
            className="w-full rounded-xl border border-line/60 bg-surface-muted/30 px-3 py-2 text-[15px] text-ink outline-none focus:border-accent dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('groupSettingsBanReasonPlaceholder')}
            className="mt-3 w-full rounded-xl border border-line/60 bg-surface-muted/30 px-3 py-2 text-[15px] text-ink outline-none focus:border-accent dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />

          {q.trim() && candidates.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-2xl border border-line/60 dark:border-white/[0.10]">
              {candidates.map((m) => {
                const uid = m.user.id ?? m.userId;
                const name = m.user.displayName ?? m.user.username;
                return (
                  <button
                    key={uid}
                    type="button"
                    onClick={() => ban.mutate(uid)}
                    disabled={ban.isPending}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-muted/60 disabled:opacity-50 dark:hover:bg-white/[0.06]"
                  >
                    <SafeAvatar
                      url={m.user.avatarUrl ?? null}
                      label={name.slice(0, 1).toUpperCase()}
                      className="h-9 w-9 shrink-0 rounded-full ring-1 ring-line/50 dark:ring-white/10"
                      fallbackClassName="text-xs font-semibold text-ink"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold text-ink dark:text-white">
                        {name}
                      </div>
                      <div className="truncate text-[13px] text-ink-muted dark:text-white/55">
                        @{m.user.username}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-red-500">
                      {t('groupSettingsBanUser')}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </TgCard>

      <TgCard title={t('groupSettingsBansTitle')} className="mt-6">
        {(bans?.items ?? []).length === 0 ? (
          <div className="px-4 py-4 text-[13px] text-ink-muted dark:text-white/55">
            {t('groupSettingsNoBans')}
          </div>
        ) : (
          (bans?.items ?? []).map((b) => {
            const name = b.user.displayName ?? b.user.username;
            return (
              <TgRow key={b.user.id}>
                <SafeAvatar
                  url={b.user.avatarUrl}
                  label={name.slice(0, 1).toUpperCase()}
                  className="h-10 w-10 shrink-0 rounded-full ring-1 ring-line/50 dark:ring-white/10"
                  fallbackClassName="text-sm font-semibold text-ink"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink dark:text-white">
                    {name}
                  </div>
                  <div className="truncate text-[13px] text-ink-muted dark:text-white/55">
                    @{b.user.username}
                  </div>
                  {b.reason ? (
                    <div className="mt-0.5 truncate text-[12px] text-ink-muted dark:text-white/55">
                      {b.reason}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={unban.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    unban.mutate(b.user.id);
                  }}
                  className="ml-2 shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-accent disabled:opacity-50"
                >
                  {t('groupSettingsUnbanUser')}
                </button>
              </TgRow>
            );
          })
        )}
      </TgCard>
    </TgPage>
  );
}
