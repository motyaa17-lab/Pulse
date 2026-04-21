'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { SafeAvatar } from '@/components/pulse/safe-avatar';
import { useT, type I18nKey } from '@/lib/i18n';
import { cn } from '@/lib/cn';
import type { MeUserDto } from '@/lib/types';

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

export default function GroupSettingsPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();

  const {
    data: chat,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`),
  });

  const isAdmin = chat?.role === 'OWNER' || chat?.role === 'ADMIN';
  const isGroup = chat?.type === 'GROUP';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [onlyAdminsAdd, setOnlyAdminsAdd] = useState(false);
  const [inviteOn, setInviteOn] = useState(true);

  useEffect(() => {
    if (!chat) return;
    setTitle(chat.title ?? '');
    setDescription(chat.group?.description ?? '');
    setOnlyAdminsAdd(Boolean(chat.group?.onlyAdminsCanAddMembers));
    setInviteOn(chat.group?.inviteEnabled !== false);
  }, [chat]);

  useEffect(() => {
    if (!chat || isLoading) return;
    if (chat.type !== 'GROUP') {
      router.replace(`/chats/${chatId}`);
    }
  }, [chat, chatId, isLoading, router]);

  const inviteUrl = useMemo(() => {
    const slug = chat?.group?.inviteSlug;
    if (!slug || typeof window === 'undefined') return '';
    return `${window.location.origin}/join/g/${slug}`;
  }, [chat?.group?.inviteSlug]);

  const saveProfile = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`, {
        method: 'PATCH',
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
        },
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const saveGroupFlags = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/group-settings`, {
        method: 'PATCH',
        body: {
          onlyAdminsCanAddMembers: onlyAdminsAdd,
          inviteEnabled: inviteOn,
        },
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const rotateInvite = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/group/invite/rotate`, {
        method: 'POST',
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
    },
  });

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{ ok: boolean }>(`/chats/${chatId}/members/${userId}/remove`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chat', chatId] });
      void qc.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const leaveChat = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean }>(`/chats/${chatId}/leave`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['chats'] });
      qc.removeQueries({ queryKey: ['chat', chatId] });
      router.replace('/chats');
    },
  });

  const membersSorted = useMemo(() => {
    const list = chat?.members ?? [];
    const order = (r: string) => (r === 'OWNER' ? 0 : r === 'ADMIN' ? 1 : r === 'MEMBER' ? 2 : 3);
    return [...list].sort((a, b) => order(a.role) - order(b.role));
  }, [chat?.members]);

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = inviteUrl;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  };

  if (isLoading || !chat) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-white/60 md:text-ink-muted">
        {t('commonLoading')}
      </div>
    );
  }

  if (isError || !isGroup) {
    return null;
  }

  const profileDirty =
    title.trim() !== (chat.title ?? '').trim() ||
    description.trim() !== (chat.group?.description ?? '').trim();
  const flagsDirty =
    onlyAdminsAdd !== Boolean(chat.group?.onlyAdminsCanAddMembers) ||
    inviteOn !== (chat.group?.inviteEnabled !== false);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const SectionCard = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <section
      id={id}
      className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45"
    >
      <div className="px-4 pb-2 pt-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
          {title}
        </h2>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );

  const Row = ({
    icon,
    label,
    value,
    onClick,
    danger,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    danger?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.06] active:bg-white/[0.08]',
        'border-t border-white/10 first:border-t-0 md:border-line/50 dark:md:border-line/40',
      )}
    >
      <span
        className={cn(
          'grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-white/85',
          danger && 'bg-red-500/10 text-red-200',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-[15px] font-medium', danger && 'text-red-200')}>
          {label}
        </span>
        {value ? (
          <span className="mt-0.5 block truncate text-[12px] text-white/45">{value}</span>
        ) : null}
      </span>
      <span className="shrink-0 text-white/35">›</span>
    </button>
  );

  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:max-h-none md:flex-none md:py-8 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href={`/chats/${chatId}`}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/90 transition hover:bg-white/10 md:border-line/70 md:bg-transparent md:text-ink-muted md:hover:bg-surface-muted/60 dark:md:border-line/45"
        >
          ← {t('groupSettingsBack')}
        </Link>
        <button
          type="button"
          onClick={() => scrollToId('tg-profile')}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white/90 transition hover:bg-white/10 md:border-line/70 md:bg-transparent md:text-ink-muted md:hover:bg-surface-muted/60 dark:md:border-line/45"
        >
          {t('editMessage')}
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <SafeAvatar
          url={chat.avatarUrl ?? null}
          label={(chat.title ?? '?').slice(0, 1)}
          className="h-24 w-24 rounded-full ring-2 ring-white/10"
          fallbackClassName="text-2xl font-semibold text-white/85"
        />
        <h1 className="mt-4 font-display text-2xl font-semibold text-white md:text-ink">
          {chat.title ?? t('group')}
        </h1>
        <p className="mt-1 text-sm text-white/55 md:text-ink-muted">
          {membersSorted.length} {t('groupSettingsMembersTitle').toLowerCase()}
        </p>
        {(chat.group?.description ?? '').trim() ? (
          <p className="mt-3 max-w-[28rem] rounded-2xl bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/70 md:bg-surface-muted/40 md:text-ink-muted">
            {(chat.group?.description ?? '').trim()}
          </p>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
        <Row
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
          label={t('groupSettingsMembersTitle')}
          value={`${membersSorted.length}`}
          onClick={() => scrollToId('tg-members')}
        />
        <Row
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
          label={t('groupSettingsProfileSection')}
          value={isAdmin ? t('groupSettingsSaveProfile') : t('drawerYourRole')}
          onClick={() => scrollToId('tg-profile')}
        />
        <Row
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 1l3 5 5 1-4 4 1 6-5-3-5 3 1-6-4-4 5-1 3-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
          label={t('groupSettingsPermissionsSection')}
          value={onlyAdminsAdd ? t('memberRoleAdmin') : t('memberRoleMember')}
          onClick={() => scrollToId('tg-perms')}
        />
        <Row
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1-7.07 7.07L10 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label={t('groupSettingsInviteSection')}
          value={inviteOn ? t('createGroupInviteLinkOn') : t('groupSettingsInviteDisabledWarning')}
          onClick={() => scrollToId('tg-invite')}
        />
      </div>

      <SectionCard id="tg-profile" title={t('groupSettingsProfileSection')}>
        <label className="block text-sm font-medium md:text-ink">
          {t('createGroupNameLabel')}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isAdmin}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 disabled:opacity-60 md:border-line md:bg-surface-muted/30 md:text-ink md:focus:border-accent dark:md:border-line/45"
            maxLength={120}
          />
        </label>
        <label className="block text-sm font-medium md:text-ink">
          {t('createGroupDescLabel')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAdmin}
            rows={3}
            maxLength={500}
            className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 disabled:opacity-60 md:border-line md:bg-surface-muted/30 md:text-ink md:focus:border-accent dark:md:border-line/45"
          />
        </label>
        {isAdmin && (
          <button
            type="button"
            disabled={!profileDirty || saveProfile.isPending}
            onClick={() => saveProfile.mutate()}
            className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white disabled:opacity-45 md:bg-accent"
          >
            {saveProfile.isPending ? t('commonLoading') : t('groupSettingsSaveProfile')}
          </button>
        )}
        {saveProfile.isError && (
          <p className="text-center text-xs text-red-400 md:text-red-500">
            {t('groupSettingsSaveFailed')}
          </p>
        )}
      </SectionCard>

      <SectionCard
        id="tg-members"
        title={`${t('groupSettingsMembersTitle')} (${membersSorted.length})`}
      >
        <ul className="space-y-2">
          {membersSorted.map((m) => {
            const uid = m.user.id ?? m.userId;
            const canRemove = isAdmin && uid !== me?.id && m.role !== 'OWNER';
            return (
              <li
                key={m.userId}
                className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 md:border-line/50 dark:md:border-line/40"
              >
                <SafeAvatar
                  url={m.user.avatarUrl ?? null}
                  label={(m.user.displayName ?? m.user.username).slice(0, 1).toUpperCase()}
                  className="h-10 w-10 shrink-0 rounded-full ring-1 ring-white/15"
                  fallbackClassName="text-sm font-semibold text-sky-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium md:text-ink">
                    {m.user.displayName ?? m.user.username}
                  </p>
                  <p className="truncate text-xs text-white/50 md:text-ink-muted">
                    @{m.user.username}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70 md:bg-surface-muted md:text-ink-muted">
                  {memberRoleLabel(m.role, t)}
                </span>
                {canRemove ? (
                  <button
                    type="button"
                    disabled={removeMember.isPending}
                    className="shrink-0 rounded-lg border border-red-400/40 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-50 md:text-red-600"
                    onClick={() => {
                      if (!window.confirm(t('groupSettingsRemoveMemberConfirm'))) return;
                      removeMember.mutate(uid);
                    }}
                  >
                    {t('groupSettingsRemoveMember')}
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <SectionCard id="tg-perms" title={t('groupSettingsPermissionsSection')}>
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50 dark:md:border-line/40',
            !isAdmin && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={onlyAdminsAdd}
            disabled={!isAdmin}
            onChange={(e) => setOnlyAdminsAdd(e.target.checked)}
          />
          <span>
            <span className="font-medium md:text-ink">
              {t('groupSettingsOnlyAdminsAddMembers')}
            </span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('groupSettingsOnlyAdminsAddMembersHint')}
            </span>
          </span>
        </label>
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 md:border-line/50 dark:md:border-line/40',
            !isAdmin && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={inviteOn}
            disabled={!isAdmin}
            onChange={(e) => setInviteOn(e.target.checked)}
          />
          <span>
            <span className="font-medium md:text-ink">{t('groupSettingsInviteLinkEnabled')}</span>
            <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
              {t('groupSettingsInviteLinkEnabledHint')}
            </span>
          </span>
        </label>
        {isAdmin && (
          <button
            type="button"
            disabled={!flagsDirty || saveGroupFlags.isPending}
            onClick={() => saveGroupFlags.mutate()}
            className="w-full rounded-xl border border-sky-400/40 bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-200 disabled:opacity-45 md:border-accent/50 md:bg-accent/10 md:text-accent"
          >
            {saveGroupFlags.isPending ? t('commonLoading') : t('groupSettingsSavePermissions')}
          </button>
        )}
        {saveGroupFlags.isError && (
          <p className="text-center text-xs text-red-400 md:text-red-500">
            {t('groupSettingsSaveFailed')}
          </p>
        )}
      </SectionCard>

      <SectionCard id="tg-invite" title={t('groupSettingsInviteSection')}>
        {chat.group?.inviteSlug ? (
          <>
            <p className="break-all rounded-xl bg-white/5 px-3 py-2 font-mono text-[12px] text-white/90 md:bg-surface-muted/40 md:text-ink">
              {inviteUrl || `…/join/g/${chat.group.inviteSlug}`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyInvite()}
                className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white md:bg-accent"
              >
                {t('groupSettingsCopyInvite')}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  disabled={rotateInvite.isPending}
                  onClick={() => {
                    if (!window.confirm(t('groupSettingsRotateInviteConfirm'))) return;
                    rotateInvite.mutate();
                  }}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 md:border-line md:text-ink dark:md:border-line/45"
                >
                  {rotateInvite.isPending ? t('commonLoading') : t('groupSettingsRotateInvite')}
                </button>
              )}
            </div>
            {!inviteOn && (
              <p className="text-xs text-amber-200/90 md:text-amber-700 dark:md:text-amber-200/90">
                {t('groupSettingsInviteDisabledWarning')}
              </p>
            )}
            {rotateInvite.isError && (
              <p className="text-xs text-red-400 md:text-red-500">
                {t('groupSettingsRotateFailed')}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-white/55 md:text-ink-muted">
            {t('groupSettingsNoInviteSlug')}
          </p>
        )}
      </SectionCard>

      <section className="mt-8 rounded-2xl border border-red-500/35 bg-red-500/5 p-4 md:border-red-500/30 md:bg-red-500/[0.06]">
        <h2 className="text-xs font-bold uppercase tracking-wide text-red-200/90 md:text-red-700">
          {t('groupSettingsLeaveSection')}
        </h2>
        <button
          type="button"
          disabled={leaveChat.isPending}
          onClick={() => {
            if (!window.confirm(t('groupSettingsLeaveConfirm'))) return;
            leaveChat.mutate(undefined, {
              onError: () => window.alert(t('groupSettingsLeaveError')),
            });
          }}
          className="mt-4 w-full rounded-xl border border-red-400/50 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:opacity-50 md:text-red-700"
        >
          {leaveChat.isPending ? t('commonLoading') : t('groupSettingsLeaveButton')}
        </button>
      </section>
    </div>
  );
}
