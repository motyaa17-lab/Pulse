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
import { uploadMedia } from '@/lib/upload-media';
import { useAuthStore } from '@/stores/auth-store';
import { fileToAvatarDataUrl } from '@/lib/avatar-dataurl';
import {
  TgCard,
  TgChevron,
  TgIconBadge,
  TgNav,
  TgPage,
  TgRow,
} from '@/components/telegram/telegram-ui';

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

export default function ChannelSettingsPage() {
  const params = useParams<{ chatId: string }>();
  const chatId = params.chatId;
  const router = useRouter();
  const qc = useQueryClient();
  const t = useT();
  const token = useAuthStore((s) => s.accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);

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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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

  const patchChat = useMutation({
    mutationFn: (body: { avatarUrl?: string | null }) =>
      apiFetch<ChatDetailForDrawer>(`/chats/${chatId}`, { method: 'PATCH', body }),
    onSuccess: (next) => {
      qc.setQueryData(['chat', chatId], next);
      void qc.invalidateQueries({ queryKey: ['chats'] });
      void qc.invalidateQueries({ queryKey: ['discover-channels'] });
    },
  });

  const onPickAvatar = async (file: File | null) => {
    if (!file) return;
    if (!token) {
      setAvatarError(t('errNotAuthenticated'));
      return;
    }
    setAvatarError(null);
    const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
      setAvatarError(t('errAvatarNotImage'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t('errAvatarTooLarge'));
      return;
    }
    setAvatarUploading(true);
    try {
      try {
        const meta = await uploadMedia(file, 'image', token, sessionId ?? null);
        await patchChat.mutateAsync({ avatarUrl: meta.url });
      } catch {
        const dataUrl = await fileToAvatarDataUrl(file);
        await patchChat.mutateAsync({ avatarUrl: dataUrl });
      }
    } catch {
      setAvatarError(t('errAvatarUploadFailed'));
    } finally {
      setAvatarUploading(false);
    }
  };

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

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <TgPage className="max-w-lg">
      <TgNav
        title={t('channelSettingsTitle')}
        backHref={`/chats/${chatId}`}
        backLabel={t('backToChatsLink')}
        right={
          <button
            type="button"
            className="min-h-[44px] px-2 text-[15px] font-semibold text-accent"
            onClick={() => scrollToId('tg-profile')}
          >
            {t('editMessage')}
          </button>
        }
      />

      <div className="mt-4 flex flex-col items-center text-center">
        <label className={cn('relative block', isAdmin && 'cursor-pointer')}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={!isAdmin || avatarUploading}
            onChange={(e) => void onPickAvatar(e.target.files?.[0] ?? null)}
          />
          <SafeAvatar
            url={chat.avatarUrl ?? null}
            label={(chat.title ?? '?').slice(0, 1)}
            className={cn(
              'h-24 w-24 rounded-full ring-1 ring-line/60 dark:ring-white/10',
              isAdmin && 'transition hover:ring-accent/35',
            )}
            fallbackClassName="text-2xl font-semibold text-ink"
          />
          {isAdmin ? (
            <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-accent text-white shadow-sm ring-2 ring-surface">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          ) : null}
        </label>
        {avatarUploading ? (
          <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">{t('commonLoading')}</p>
        ) : null}
        {avatarError ? <p className="mt-2 text-[13px] text-red-500">{avatarError}</p> : null}
        <h1 className="mt-4 font-display text-[1.55rem] font-semibold leading-tight text-ink dark:text-white">
          {chat.title ?? t('channel')}
        </h1>
        <p className="mt-1 text-[13px] text-ink-muted dark:text-white/55">
          {isPrivate ? t('channelSettingsTypePrivate') : t('channelSettingsTypePublic')}
        </p>
        {(chat.channel?.description ?? '').trim() ? (
          <p className="mt-3 max-w-[28rem] rounded-2xl bg-surface-muted/35 px-4 py-3 text-[14px] leading-relaxed text-ink-muted dark:bg-white/[0.06] dark:text-white/60">
            {(chat.channel?.description ?? '').trim()}
          </p>
        ) : null}
      </div>

      <TgCard className="mt-6">
        <TgRow href={`/chats/${chatId}/channel/admins`}>
          <TgIconBadge>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 8v6M23 11h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </TgIconBadge>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">
              {t('channelSettingsAdminsTitle')}
            </div>
            <div className="mt-0.5 text-[13px] text-ink-muted">
              {t('channelSettingsAdminsSubtitle')}
            </div>
          </div>
          <TgChevron />
        </TgRow>
        <TgRow href={`/chats/${chatId}/channel/recent-actions`}>
          <TgIconBadge>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
          </TgIconBadge>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold">
              {t('channelSettingsRecentActionsTitle')}
            </div>
            <div className="mt-0.5 text-[13px] text-ink-muted">
              {t('channelSettingsActionsSubtitle')}
            </div>
          </div>
          <TgChevron />
        </TgRow>
      </TgCard>

      <div id="tg-profile" className="mt-6">
        <TgCard title={t('channelSettingsProfileSection')}>
          <div className="px-4 pb-4">
            <label className="block text-[13px] font-semibold text-ink-muted">
              {t('createChannelNameLabel')}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isAdmin}
                className="mt-2 w-full rounded-xl border border-line/60 bg-surface-muted/30 px-3 py-2 text-[15px] text-ink outline-none focus:border-accent disabled:opacity-60 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                maxLength={120}
              />
            </label>
            <label className="mt-4 block text-[13px] font-semibold text-ink-muted">
              {t('createChannelDescLabel')}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
                rows={3}
                maxLength={500}
                className="mt-2 w-full resize-none rounded-xl border border-line/60 bg-surface-muted/30 px-3 py-2 text-[15px] text-ink outline-none focus:border-accent disabled:opacity-60 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            </label>
            {isAdmin && (
              <button
                type="button"
                disabled={!profileDirty || saveProfile.isPending}
                onClick={() => saveProfile.mutate()}
                className="mt-4 w-full rounded-xl bg-accent py-2.5 text-[15px] font-semibold text-white disabled:opacity-45"
              >
                {saveProfile.isPending ? t('commonLoading') : t('channelSettingsSaveProfile')}
              </button>
            )}
            {saveProfile.isError && (
              <p className="mt-2 text-center text-xs text-red-500">
                {t('channelSettingsSaveFailed')}
              </p>
            )}
          </div>
        </TgCard>
      </div>

      <TgCard
        title={`${t('channelSettingsMembersTitle')} (${membersSorted.length})`}
        className="mt-6"
      >
        {membersSorted.map((m) => {
          const uid = m.user.id ?? m.userId;
          const canRemove = isAdmin && uid !== me?.id && m.role !== 'OWNER';
          return (
            <TgRow
              key={m.userId}
              href={uid ? `/users/${uid}` : undefined}
              className={cn(!uid && 'cursor-default')}
            >
              <SafeAvatar
                url={m.user.avatarUrl ?? null}
                label={(m.user.displayName ?? m.user.username).slice(0, 1).toUpperCase()}
                className="h-10 w-10 shrink-0 rounded-full ring-1 ring-line/50 dark:ring-white/10"
                fallbackClassName="text-sm font-semibold text-ink"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-ink dark:text-white">
                  {m.user.displayName ?? m.user.username}
                </div>
                <div className="truncate text-[13px] text-ink-muted dark:text-white/55">
                  @{m.user.username}
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted dark:bg-white/[0.08] dark:text-white/65">
                {memberRoleLabel(m.role, t)}
              </span>
              {canRemove ? (
                <button
                  type="button"
                  disabled={removeMember.isPending}
                  className="ml-1 shrink-0 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-red-500 disabled:opacity-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!window.confirm(t('groupSettingsRemoveMemberConfirm'))) return;
                    removeMember.mutate(uid);
                  }}
                >
                  {t('groupSettingsRemoveMember')}
                </button>
              ) : (
                <TgChevron />
              )}
            </TgRow>
          );
        })}
      </TgCard>

      {!isPrivate ? (
        <TgCard title={t('channelSettingsHandleSection')} className="mt-6">
          <div className="px-4 pb-4">
            <label className="block text-[13px] font-semibold text-ink-muted">
              {t('createChannelHandleLabel')}
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
                disabled={!isAdmin}
                maxLength={32}
                className="mt-2 w-full rounded-xl border border-line/60 bg-surface-muted/30 px-3 py-2 font-mono text-[15px] text-ink outline-none focus:border-accent disabled:opacity-60 dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                placeholder="my_channel"
              />
              <span className="mt-2 block text-[12px] text-ink-muted dark:text-white/55">
                {t('createChannelHandleHint')}
              </span>
            </label>
            {isAdmin && (
              <button
                type="button"
                disabled={!flagsDirty || saveChannelFlags.isPending}
                onClick={() => saveChannelFlags.mutate()}
                className="mt-4 w-full rounded-xl border border-accent/35 bg-accent/10 py-2.5 text-[15px] font-semibold text-accent disabled:opacity-45"
              >
                {saveChannelFlags.isPending ? t('commonLoading') : t('channelSettingsSaveHandle')}
              </button>
            )}
            {publicJoinUrl ? (
              <div className="mt-4 space-y-2">
                <p className="text-[13px] font-semibold text-ink-muted">
                  {t('channelSettingsPublicLinkSection')}
                </p>
                <p className="break-all rounded-xl bg-surface-muted/35 px-3 py-2 font-mono text-[12px] text-ink dark:bg-white/[0.06] dark:text-white">
                  {publicJoinUrl}
                </p>
                <button
                  type="button"
                  onClick={() => void copyText(publicJoinUrl)}
                  className="w-full rounded-xl bg-accent py-2.5 text-[15px] font-semibold text-white"
                >
                  {t('channelSettingsCopyPublicLink')}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted dark:text-white/60">
                {t('channelSettingsNoHandleHint')}
              </p>
            )}
            {saveChannelFlags.isError && (
              <p className="mt-2 text-center text-xs text-red-500">
                {t('channelSettingsSaveFailed')}
              </p>
            )}
          </div>
        </TgCard>
      ) : (
        <TgCard title={t('channelSettingsInviteSection')} className="mt-6">
          <div className="px-4 pb-4">
            <label
              className={cn(
                'flex items-start gap-3 rounded-xl border border-line/60 bg-surface-muted/30 p-3 dark:border-white/[0.10] dark:bg-white/[0.06]',
                !isAdmin && 'opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={inviteOn}
                disabled={!isAdmin}
                onChange={(e) => setInviteOn(e.target.checked)}
              />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink dark:text-white">
                  {t('channelSettingsInviteLinkEnabled')}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-muted dark:text-white/55">
                  {t('channelSettingsInviteLinkEnabledHint')}
                </span>
              </span>
            </label>

            {isAdmin && (
              <button
                type="button"
                disabled={!flagsDirty || saveChannelFlags.isPending}
                onClick={() => saveChannelFlags.mutate()}
                className="mt-4 w-full rounded-xl border border-accent/35 bg-accent/10 py-2.5 text-[15px] font-semibold text-accent disabled:opacity-45"
              >
                {saveChannelFlags.isPending
                  ? t('commonLoading')
                  : t('channelSettingsSaveInviteToggle')}
              </button>
            )}

            {chat.channel?.inviteSlug ? (
              <>
                <p className="mt-4 break-all rounded-xl bg-surface-muted/35 px-3 py-2 font-mono text-[12px] text-ink dark:bg-white/[0.06] dark:text-white">
                  {privateInviteUrl || `…/join/c/${chat.channel.inviteSlug}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText(privateInviteUrl)}
                    className="rounded-xl bg-accent px-4 py-2 text-[15px] font-semibold text-white"
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
                      className="rounded-xl border border-line/60 px-4 py-2 text-[15px] font-semibold text-ink dark:border-white/[0.10] dark:text-white"
                    >
                      {rotateInvite.isPending
                        ? t('commonLoading')
                        : t('channelSettingsRotateInvite')}
                    </button>
                  )}
                </div>
                {!inviteOn && (
                  <p className="mt-2 text-[13px] text-amber-700 dark:text-amber-200/90">
                    {t('channelSettingsInviteDisabledWarning')}
                  </p>
                )}
                {rotateInvite.isError && (
                  <p className="mt-2 text-[13px] text-red-500">
                    {t('channelSettingsRotateFailed')}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-[13px] text-ink-muted dark:text-white/60">
                {t('channelSettingsNoInviteSlug')}
              </p>
            )}
            {saveChannelFlags.isError && (
              <p className="mt-2 text-center text-xs text-red-500">
                {t('channelSettingsSaveFailed')}
              </p>
            )}
          </div>
        </TgCard>
      )}

      <TgCard className="mt-6">
        <TgRow
          onClick={() => {
            if (!window.confirm(t('channelSettingsLeaveConfirm'))) return;
            leaveChat.mutate(undefined, {
              onError: () => window.alert(t('channelSettingsLeaveError')),
            });
          }}
          className="text-red-600 dark:text-red-400"
        >
          <div className="min-w-0 flex-1 text-center text-[15px] font-semibold">
            {leaveChat.isPending ? t('commonLoading') : t('channelSettingsLeaveButton')}
          </div>
        </TgRow>
      </TgCard>
    </TgPage>
  );
}
