'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, toPublicUrl } from '@/lib/api';
import type { MeUserDto, StoryFeedItem } from '@/lib/types';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth-store';
import { uploadMedia } from '@/lib/upload-media';
import { useT } from '@/lib/i18n';

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function StoriesStrip() {
  const t = useT();
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const sessionId = useAuthStore((s) => s.sessionId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewer, setViewer] = useState<StoryFeedItem | null>(null);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeUserDto>('/users/me'),
  });

  const feedQuery = useQuery({
    queryKey: ['stories', 'feed'],
    queryFn: () => apiFetch<{ items: StoryFeedItem[] }>('/stories/feed'),
    enabled: Boolean(token),
  });

  const createStory = useMutation({
    mutationFn: async (file: File) => {
      if (!token) throw new Error('no token');
      const kind = file.type.startsWith('video/') ? 'video' : 'image';
      const meta = await uploadMedia(file, kind, token, sessionId);
      return apiFetch<StoryFeedItem>('/stories', {
        method: 'POST',
        body: {
          storageKey: meta.storageKey,
          mimeType: meta.mimeType,
          fileName: meta.fileName,
          sizeBytes: meta.sizeBytes,
          url: meta.url,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories', 'feed'] });
    },
  });

  const deleteStory = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: boolean }>(`/stories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories', 'feed'] });
      setViewer(null);
    },
  });

  const items = feedQuery.data?.items ?? [];
  const meId = me?.id;
  const sorted = [...items].sort((a, b) => {
    if (meId && a.userId === meId) return -1;
    if (meId && b.userId === meId) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const onPickFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (!f || !token) return;
      try {
        await createStory.mutateAsync(f);
      } catch {
        /* toast optional */
      }
    },
    [createStory, token],
  );

  const ringLabel = (s: StoryFeedItem) =>
    s.user.displayName?.trim() || s.user.username || t('publicUserFallback');

  return (
    <>
      <div className="border-b border-white/[0.06] px-2 py-2">
        <p className="mb-1.5 px-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/45">
          {t('storiesRowTitle')}
        </p>
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            disabled={!token || createStory.isPending}
            onClick={() => fileRef.current?.click()}
            className="flex shrink-0 flex-col items-center gap-1 touch-manipulation"
            aria-label={t('storiesAddAria')}
          >
            <span className="relative grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full border-2 border-dashed border-white/25 bg-white/[0.04] text-white/70 transition hover:border-[#3390ec]/80 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] disabled:opacity-50">
              <PlusIcon />
            </span>
            <span className="max-w-[4.5rem] truncate text-center text-[11px] font-medium text-white/55">
              {t('storiesAdd')}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            onChange={onPickFile}
          />

          {feedQuery.isLoading && (
            <div className="flex shrink-0 items-center px-2 text-[12px] text-white/45">
              {t('commonLoading')}
            </div>
          )}

          {!feedQuery.isLoading && sorted.length === 0 && (
            <div className="flex min-w-0 flex-1 items-center px-2 text-[12px] leading-snug text-white/40">
              {t('storiesEmptyHint')}
            </div>
          )}

          {sorted.map((s) => {
            const av = toPublicUrl(s.user.avatarUrl);
            const isSelf = meId && s.userId === meId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setViewer(s)}
                className="flex shrink-0 flex-col items-center gap-1 touch-manipulation"
              >
                <span
                  className={cn(
                    'rounded-full bg-gradient-to-tr p-[2.5px]',
                    isSelf
                      ? 'from-emerald-400/90 via-[#3390ec] to-fuchsia-500/90'
                      : 'from-[#3390ec]/90 via-cyan-400/80 to-emerald-400/70',
                  )}
                >
                  <span className="block rounded-full bg-[#17212b] p-[2px]">
                    {av ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={av} alt="" className="h-14 w-14 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111921] text-lg font-semibold text-white/80">
                        {ringLabel(s).slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </span>
                </span>
                <span className="max-w-[4.5rem] truncate text-center text-[11px] font-medium text-white/70">
                  {isSelf ? t('storiesYou') : ringLabel(s)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewer && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t('storiesViewerAria')}
        >
          <div className="flex items-center justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{ringLabel(viewer)}</p>
              <p className="text-[11px] text-white/50">{t('storyExpiresHint')}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {meId && viewer.userId === meId && (
                <button
                  type="button"
                  disabled={deleteStory.isPending}
                  onClick={() => deleteStory.mutate(viewer.id)}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-red-300 transition hover:bg-white/15"
                >
                  {t('storyDelete')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewer(null)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/16"
                aria-label={t('close')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {viewer.mimeType.startsWith('video/') ? (
              <video
                src={toPublicUrl(viewer.url) ?? viewer.url}
                className="max-h-full max-w-full rounded-xl"
                controls
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toPublicUrl(viewer.url) ?? viewer.url}
                alt=""
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
