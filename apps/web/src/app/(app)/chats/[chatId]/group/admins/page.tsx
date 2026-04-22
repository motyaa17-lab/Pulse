'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { useT, type I18nKey } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import { TgCard, TgChevron, TgNav, TgPage, TgRow } from '@/components/telegram/telegram-ui';

function memberRoleLabel(role: string, t: (k: I18nKey) => string) {
  switch (role) {
    case 'OWNER':
      return t('memberRoleOwner');
    case 'ADMIN':
      return t('memberRoleAdmin');
    case 'SUBSCRIBER':
      return t('memberRoleSubscriber');
    default:
      return t('memberRoleMember');
  }
}

export default function GroupAdminsPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const t = useT();
  const qc = useQueryClient();

  const { data: chat, isLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
  });

  const isOwner = chat?.role === 'OWNER';
  const isAdmin = chat?.role === 'OWNER' || chat?.role === 'ADMIN';

  const sorted = useMemo(() => {
    const list = chat?.members ?? [];
    const order = (r: string) => (r === 'OWNER' ? 0 : r === 'ADMIN' ? 1 : r === 'MEMBER' ? 2 : 3);
    return [...list].sort((a, b) => order(a.role) - order(b.role));
  }, [chat?.members]);

  const setRole = useMutation({
    mutationFn: (p: { userId: string; role: 'ADMIN' | 'MEMBER' }) =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/members/${p.userId}/role`, {
        method: 'POST',
        body: { role: p.role },
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const transfer = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/transfer-ownership`, {
        method: 'POST',
        body: { userId },
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  if (isLoading || !chat) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/60 md:text-ink-muted">
        {t('commonLoading')}
      </div>
    );
  }

  return (
    <TgPage className="max-w-lg">
      <TgNav
        title={t('groupSettingsAdminsTitle')}
        backHref={`/chats/${chatId}/group`}
        backLabel={t('groupSettingsBackToGroupSettings')}
      />

      <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">
        {t('groupSettingsAdminsSubtitle')}
      </p>

      <TgCard title={t('groupSettingsAdminsTitle')} className="mt-4">
        {sorted
          .filter((m) => m.role === 'OWNER' || m.role === 'ADMIN')
          .map((m) => {
            const uid = m.user.id ?? m.userId;
            const name = m.user.displayName ?? m.user.username;
            const canDemote = isOwner && m.role === 'ADMIN';
            return (
              <TgRow key={uid}>
                <SafeAvatar
                  url={m.user.avatarUrl ?? null}
                  label={name.slice(0, 1).toUpperCase()}
                  className="h-10 w-10 shrink-0 rounded-full ring-1 ring-line/50 dark:ring-white/10"
                  fallbackClassName="text-sm font-semibold text-ink"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink dark:text-white">
                    {name}
                  </div>
                  <div className="truncate text-[13px] text-ink-muted dark:text-white/55">
                    @{m.user.username}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted dark:bg-white/[0.08] dark:text-white/65">
                  {memberRoleLabel(m.role, t)}
                </span>
                {canDemote ? (
                  <button
                    type="button"
                    disabled={setRole.isPending}
                    className="ml-2 shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-red-500 disabled:opacity-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRole.mutate({ userId: uid, role: 'MEMBER' });
                    }}
                  >
                    {t('groupSettingsDismissAdmin')}
                  </button>
                ) : (
                  <TgChevron />
                )}
              </TgRow>
            );
          })}
      </TgCard>

      <TgCard title={t('groupSettingsMembersTitle')} className="mt-6">
        {sorted
          .filter((m) => m.role !== 'OWNER' && m.role !== 'ADMIN')
          .map((m) => {
            const uid = m.user.id ?? m.userId;
            const name = m.user.displayName ?? m.user.username;
            const canPromote = isOwner;
            const canTransfer = isOwner;
            return (
              <TgRow key={uid}>
                <SafeAvatar
                  url={m.user.avatarUrl ?? null}
                  label={name.slice(0, 1).toUpperCase()}
                  className="h-10 w-10 shrink-0 rounded-full ring-1 ring-line/50 dark:ring-white/10"
                  fallbackClassName="text-sm font-semibold text-ink"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink dark:text-white">
                    {name}
                  </div>
                  <div className="truncate text-[13px] text-ink-muted dark:text-white/55">
                    @{m.user.username}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {canPromote ? (
                    <button
                      type="button"
                      disabled={setRole.isPending}
                      className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-[13px] font-semibold text-accent disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRole.mutate({ userId: uid, role: 'ADMIN' });
                      }}
                    >
                      {t('groupSettingsMakeAdmin')}
                    </button>
                  ) : null}
                  {canTransfer ? (
                    <button
                      type="button"
                      disabled={transfer.isPending}
                      className="rounded-lg border border-line/60 px-2.5 py-1 text-[13px] font-semibold text-ink disabled:opacity-50 dark:border-white/[0.10] dark:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!window.confirm(t('groupSettingsTransferOwnershipConfirm'))) return;
                        transfer.mutate(uid);
                      }}
                    >
                      {t('groupSettingsTransferOwnership')}
                    </button>
                  ) : null}
                </div>
              </TgRow>
            );
          })}
      </TgCard>

      {!isAdmin && (
        <p className="mt-6 rounded-xl bg-surface-muted/35 px-3 py-2 text-center text-[13px] text-ink-muted dark:bg-white/[0.06] dark:text-white/55">
          {t('drawerYourRole')}
        </p>
      )}
    </TgPage>
  );
}
