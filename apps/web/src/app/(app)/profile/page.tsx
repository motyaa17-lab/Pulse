'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, API_URL, toPublicUrl } from '@/lib/api';
import type { MeUserDto } from '@/lib/types';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useT } from '@/lib/i18n';

export default function MyProfilePage() {
  const t = useT();
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  //force redeploy

  useEffect(() => {
    if (!me) return;
    setDisplayName(me.displayName ?? '');
    setUsername(me.username ?? '');
    setBio(me.bio ?? '');
    setAvatarUrl(me.avatarUrl ?? null);
  }, [me?.id, me?.avatarUrl, me?.bio, me?.displayName, me?.username]);

  const patchMe = useMutation({
    mutationFn: (
      body: Partial<Pick<MeUserDto, 'displayName' | 'username' | 'bio' | 'avatarUrl'>>,
    ) => apiFetch<MeUserDto>('/users/me', { method: 'PATCH', body }),
    onSuccess: (updated: MeUserDto) => {
      qc.setQueryData(['me'], updated);
    },
  });

  //force redeploy
  const save = useMutation({
    mutationFn: () =>
      apiFetch<MeUserDto>('/users/me', {
        method: 'PATCH',
        body: {
          displayName: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatarUrl,
        },
      }),
    onSuccess: (updated: MeUserDto) => {
      qc.setQueryData(['me'], updated);
    },
  });

  const uploadAvatar = async (file: File) => {
    if (!token) throw new Error(t('errNotAuthenticated'));
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
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', 'image');
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (sessionId) headers['x-session-fingerprint'] = sessionId;
    const res = await fetch(`${API_URL}/media/upload`, { method: 'POST', headers, body: fd });
    try {
      if (!res.ok) throw new Error('upload failed');
      const meta = (await res.json()) as { url: string };
      setAvatarUrl(meta.url);
      await patchMe.mutateAsync({ avatarUrl: meta.url });
    } catch {
      setAvatarError(t('errAvatarUploadFailed'));
    } finally {
      setAvatarUploading(false);
    }
  };

  const initial = (me?.displayName ?? me?.username ?? '?').slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <Link href="/settings" className="text-sm text-accent">
        {t('backToSettings')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t('profilePageTitle')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('profilePageSubtitle')}</p>

      <section className="mt-8 rounded-2xl border border-line bg-surface-elevated p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0">
            {toPublicUrl(avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicUrl(avatarUrl)!}
                alt=""
                className="h-14 w-14 rounded-full object-cover ring-1 ring-line/45"
              />
            ) : (
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ring-1 ring-line/40',
                  'bg-gradient-to-br from-accent/35 to-accent/10 text-accent',
                )}
              >
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">
              {me?.displayName ??
                me?.username ??
                (isLoading ? t('profileLoading') : t('profileDash'))}
            </div>
            <div className="truncate text-xs text-ink-muted">
              @{me?.username ?? t('profileDash')}
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-line px-3 py-2 text-sm text-ink-muted hover:text-ink">
            {avatarUploading ? t('uploadingAvatar') : t('changeAvatar')}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await uploadAvatar(f);
                } finally {
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
        {avatarError && <p className="mt-2 text-sm text-red-500">{avatarError}</p>}

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t('labelDisplayName')}
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-surface-muted/40 px-3 text-sm text-ink outline-none focus:border-accent/40"
              placeholder={t('placeholderDisplayName')}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t('labelUsername')}
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-surface-muted/40 px-3 text-sm text-ink outline-none focus:border-accent/40"
              placeholder={t('placeholderUsername')}
            />
            <p className="mt-1 text-xs text-ink-muted">{t('usernameRules')}</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {t('labelBio')}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 w-full resize-none rounded-xl border border-line bg-surface-muted/40 px-3 py-2 text-sm text-ink outline-none focus:border-accent/40"
              placeholder={t('placeholderBio')}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending || patchMe.isPending || avatarUploading}
            className={cn(
              'inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold',
              save.isPending || patchMe.isPending || avatarUploading
                ? 'cursor-not-allowed border-line text-ink-muted'
                : 'border-accent/35 bg-accent/10 text-ink hover:border-accent/55',
            )}
          >
            {t('saveChanges')}
          </button>
          {save.isError && <span className="text-xs text-red-500">{t('saveFailed')}</span>}
          {save.isSuccess && <span className="text-xs text-ink-muted">{t('profileSaved')}</span>}
        </div>
      </section>
    </div>
  );
}
