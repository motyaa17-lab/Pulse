'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { ChatDetailForDrawer } from '@/components/pulse/chat-details-drawer';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export default function ChannelSettingsPage() {
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
  const isChannel = chat?.type === 'CHANNEL';
  const isPrivate = Boolean(chat?.isPrivate);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [inviteOn, setInviteOn] = useState(true);

  useEffect(() => {
    if (!chat) return;
    setTitle(chat.title ?? '');
    setDescription(chat.channel?.description ?? '');
    setHandle(chat.channel?.handle ?? '');
    setInviteOn(chat.channel?.inviteEnabled !== false);
  }, [chat]);

  useEffect(() => {
    if (!chat || isLoading) return;
    if (chat.type !== 'CHANNEL') {
      router.replace(`/chats/${chatId}`);
    }
  }, [chat, chatId, isLoading, router]);

  const publicJoinUrl = useMemo(() => {
    const h = chat?.channel?.handle;
    if (!h || typeof window === 'undefined') return '';
    return `${window.location.origin}/join/c/${h}`;
  }, [chat?.channel?.handle]);

  const privateInviteUrl = useMemo(() => {
    const slug = chat?.channel?.inviteSlug;
    if (!slug || typeof window === 'undefined') return '';
    return `${window.location.origin}/join/c/${slug}`;
  }, [chat?.channel?.inviteSlug]);

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

  const saveChannelFlags = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/channel-settings`, {
        method: 'PATCH',
        body: isPrivate
          ? { inviteEnabled: inviteOn }
          : { handle: handle.trim().toLowerCase() || '' },
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
      void qc.invalidateQueries({ queryKey: ['discover-channels'] });
    },
  });

  const rotateInvite = useMutation({
    mutationFn: () =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}/channel/invite/rotate`, {
        method: 'POST',
      }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
    },
  });

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
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

  if (isError || !isChannel) {
    return null;
  }

  const profileDirty =
    title.trim() !== (chat.title ?? '').trim() ||
    description.trim() !== (chat.channel?.description ?? '').trim();

  const handleNorm = handle.trim().toLowerCase();
  const flagsDirty = isPrivate
    ? inviteOn !== (chat.channel?.inviteEnabled !== false)
    : handleNorm !== (chat.channel?.handle ?? '').trim().toLowerCase();

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:py-8 md:text-ink">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={`/chats/${chatId}`}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/85 transition hover:bg-white/10 md:border-line/70 md:bg-transparent md:text-ink-muted md:hover:bg-surface-muted/60 dark:md:border-line/45"
        >
          {t('channelSettingsBack')}
        </Link>
      </div>
      <h1 className="font-display text-2xl font-semibold md:text-ink">
        {t('channelSettingsTitle')}
      </h1>
      <p className="mt-1 text-sm text-white/60 md:text-ink-muted">{t('channelSettingsSubtitle')}</p>

      <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-[11px] text-white/70 md:border-line/60 md:bg-surface-muted/25 md:text-ink-muted">
        {isPrivate ? t('channelSettingsTypePrivate') : t('channelSettingsTypePublic')}
      </p>

      <section className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
          {t('channelSettingsProfileSection')}
        </h2>
        <label className="block text-sm font-medium md:text-ink">
          {t('createChannelNameLabel')}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isAdmin}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 disabled:opacity-60 md:border-line md:bg-surface-muted/30 md:text-ink md:focus:border-accent dark:md:border-line/45"
            maxLength={120}
          />
        </label>
        <label className="block text-sm font-medium md:text-ink">
          {t('createChannelDescLabel')}
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
            {saveProfile.isPending ? t('commonLoading') : t('channelSettingsSaveProfile')}
          </button>
        )}
        {saveProfile.isError && (
          <p className="text-center text-xs text-red-400 md:text-red-500">
            {t('channelSettingsSaveFailed')}
          </p>
        )}
      </section>

      {!isPrivate && (
        <section className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
            {t('channelSettingsHandleSection')}
          </h2>
          <label className="block text-sm font-medium md:text-ink">
            {t('createChannelHandleLabel')}
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
              disabled={!isAdmin}
              maxLength={32}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none focus:border-sky-400/50 disabled:opacity-60 md:border-line md:bg-surface-muted/30 md:text-ink md:focus:border-accent dark:md:border-line/45"
              placeholder="my_channel"
            />
            <span className="mt-1 block text-[11px] text-white/50 md:text-ink-muted">
              {t('createChannelHandleHint')}
            </span>
          </label>
          {isAdmin && (
            <button
              type="button"
              disabled={!flagsDirty || saveChannelFlags.isPending}
              onClick={() => saveChannelFlags.mutate()}
              className="w-full rounded-xl border border-sky-400/40 bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-200 disabled:opacity-45 md:border-accent/50 md:bg-accent/10 md:text-accent"
            >
              {saveChannelFlags.isPending ? t('commonLoading') : t('channelSettingsSaveHandle')}
            </button>
          )}
          {publicJoinUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/45 md:text-ink-muted">
                {t('channelSettingsPublicLinkSection')}
              </p>
              <p className="break-all rounded-xl bg-white/5 px-3 py-2 font-mono text-[12px] text-white/90 md:bg-surface-muted/40 md:text-ink">
                {publicJoinUrl}
              </p>
              <button
                type="button"
                onClick={() => void copyText(publicJoinUrl)}
                className="w-full rounded-xl bg-sky-500/90 py-2 text-sm font-semibold text-white md:bg-accent"
              >
                {t('channelSettingsCopyPublicLink')}
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/55 md:text-ink-muted">
              {t('channelSettingsNoHandleHint')}
            </p>
          )}
          {saveChannelFlags.isError && (
            <p className="text-center text-xs text-red-400 md:text-red-500">
              {t('channelSettingsSaveFailed')}
            </p>
          )}
        </section>
      )}

      {isPrivate && (
        <section className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#17212b]/85 p-4 md:border-line/70 md:bg-surface-elevated/80 dark:md:border-line/45">
          <h2 className="text-xs font-bold uppercase tracking-wide text-white/50 md:text-ink-muted">
            {t('channelSettingsInviteSection')}
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
              checked={inviteOn}
              disabled={!isAdmin}
              onChange={(e) => setInviteOn(e.target.checked)}
            />
            <span>
              <span className="font-medium md:text-ink">
                {t('channelSettingsInviteLinkEnabled')}
              </span>
              <span className="mt-0.5 block text-xs text-white/55 md:text-ink-muted">
                {t('channelSettingsInviteLinkEnabledHint')}
              </span>
            </span>
          </label>
          {isAdmin && (
            <button
              type="button"
              disabled={!flagsDirty || saveChannelFlags.isPending}
              onClick={() => saveChannelFlags.mutate()}
              className="w-full rounded-xl border border-sky-400/40 bg-sky-500/15 py-2.5 text-sm font-semibold text-sky-200 disabled:opacity-45 md:border-accent/50 md:bg-accent/10 md:text-accent"
            >
              {saveChannelFlags.isPending
                ? t('commonLoading')
                : t('channelSettingsSaveInviteToggle')}
            </button>
          )}
          {chat.channel?.inviteSlug ? (
            <>
              <p className="break-all rounded-xl bg-white/5 px-3 py-2 font-mono text-[12px] text-white/90 md:bg-surface-muted/40 md:text-ink">
                {privateInviteUrl || `…/join/c/${chat.channel.inviteSlug}`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyText(privateInviteUrl)}
                  className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white md:bg-accent"
                >
                  {t('channelSettingsCopyInvite')}
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    disabled={rotateInvite.isPending}
                    onClick={() => {
                      if (!window.confirm(t('channelSettingsRotateInviteConfirm'))) return;
                      rotateInvite.mutate();
                    }}
                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/90 md:border-line md:text-ink dark:md:border-line/45"
                  >
                    {rotateInvite.isPending ? t('commonLoading') : t('channelSettingsRotateInvite')}
                  </button>
                )}
              </div>
              {!inviteOn && (
                <p className="text-xs text-amber-200/90 md:text-amber-700 dark:md:text-amber-200/90">
                  {t('channelSettingsInviteDisabledWarning')}
                </p>
              )}
              {rotateInvite.isError && (
                <p className="text-xs text-red-400 md:text-red-500">
                  {t('channelSettingsRotateFailed')}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-white/55 md:text-ink-muted">
              {t('channelSettingsNoInviteSlug')}
            </p>
          )}
          {saveChannelFlags.isError && (
            <p className="text-center text-xs text-red-400 md:text-red-500">
              {t('channelSettingsSaveFailed')}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
