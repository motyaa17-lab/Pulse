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
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href={`/chats/${chatId}/group`}
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          {t('groupSettingsBackToGroupSettings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('groupSettingsAdminsTitle')}</span>
        <span className="w-10" />
      </div>

      <p className="mt-3 text-sm text-white/55 md:text-ink-muted">
        {t('groupSettingsAdminsSubtitle')}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <ul className="divide-y divide-white/10 md:divide-line/50">
          {sorted
            .filter((m) => m.role === 'OWNER' || m.role === 'ADMIN')
            .map((m) => {
              const uid = m.user.id ?? m.userId;
              const name = m.user.displayName ?? m.user.username;
              const canDemote = isOwner && m.role === 'ADMIN';
              return (
                <li key={uid} className="flex items-center gap-3 px-4 py-3">
                  <SafeAvatar
                    url={m.user.avatarUrl ?? null}
                    label={name.slice(0, 1).toUpperCase()}
                    className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/15"
                    fallbackClassName="text-sm font-semibold text-sky-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-white md:text-ink">
                      {name}
                    </div>
                    <div className="truncate text-xs text-white/50 md:text-ink-muted">
                      @{m.user.username}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 md:bg-surface-muted md:text-ink-muted">
                    {memberRoleLabel(m.role, t)}
                  </span>
                  {canDemote ? (
                    <button
                      type="button"
                      disabled={setRole.isPending}
                      className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                      onClick={() => setRole.mutate({ userId: uid, role: 'MEMBER' })}
                    >
                      {t('groupSettingsDismissAdmin')}
                    </button>
                  ) : null}
                </li>
              );
            })}
        </ul>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('groupSettingsMembersTitle')}
          </h2>
        </div>
        <ul className="divide-y divide-white/10 md:divide-line/50">
          {sorted
            .filter((m) => m.role !== 'OWNER' && m.role !== 'ADMIN')
            .map((m) => {
              const uid = m.user.id ?? m.userId;
              const name = m.user.displayName ?? m.user.username;
              const canPromote = isOwner;
              const canTransfer = isOwner;
              return (
                <li key={uid} className="flex items-center gap-3 px-4 py-3">
                  <SafeAvatar
                    url={m.user.avatarUrl ?? null}
                    label={name.slice(0, 1).toUpperCase()}
                    className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/15"
                    fallbackClassName="text-sm font-semibold text-sky-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold text-white md:text-ink">
                      {name}
                    </div>
                    <div className="truncate text-xs text-white/50 md:text-ink-muted">
                      @{m.user.username}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {canPromote && (
                      <button
                        type="button"
                        disabled={setRole.isPending}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50',
                          'border-[#3390ec]/45 bg-[#3390ec]/12 text-[#9ad0ff] hover:bg-[#3390ec]/18',
                        )}
                        onClick={() => setRole.mutate({ userId: uid, role: 'ADMIN' })}
                      >
                        {t('groupSettingsMakeAdmin')}
                      </button>
                    )}
                    {canTransfer && (
                      <button
                        type="button"
                        disabled={transfer.isPending}
                        className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-50"
                        onClick={() => {
                          if (!window.confirm(t('groupSettingsTransferOwnershipConfirm'))) return;
                          transfer.mutate(uid);
                        }}
                      >
                        {t('groupSettingsTransferOwnership')}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {!isAdmin && (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-white/60 md:border-line/60 md:bg-surface-muted/25 md:text-ink-muted">
          {t('drawerYourRole')}
        </p>
      )}
    </div>
  );
}
