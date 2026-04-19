'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

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

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:py-8 md:text-ink">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/chats/${chatId}`}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 md:border-line/70 md:bg-transparent md:text-ink-muted md:hover:bg-surface-muted/60 dark:md:border-line/45"
        >
          {t('groupSettingsBack')}
        </Link>
      </div>
      <h1 className="font-display text-2xl font-semibold md:text-ink">{t('groupSettingsTitle')}</h1>
      <p className="mt-1 text-sm text-white/60 md:text-ink-muted">{t('groupSettingsSubtitle')}</p>

      <section className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
          {t('groupSettingsProfileSection')}
        </h2>
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
      </section>

      <section className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
          {t('groupSettingsPermissionsSection')}
        </h2>
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
      </section>

      <section className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
          {t('groupSettingsInviteSection')}
        </h2>
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
      </section>
    </div>
  );
}
