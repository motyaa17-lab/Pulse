'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';

export default function FoldersSettingsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');

  const { data } = useQuery<{ items: { id: string; title: string; chatIds: string[] }[] }>({
    queryKey: ['folders'],
    queryFn: () => apiFetch('/folders'),
  });

  const create = useMutation({
    mutationFn: () => apiFetch(`/folders`, { method: 'POST', body: { title: title.trim() } }),
    onSuccess: () => {
      setTitle('');
      void qc.invalidateQueries({ queryKey: ['folders'] });
    },
  });
  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('settings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settingsChatFolders')}</span>
        <span className="w-10" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('settingsChatFolders')}
          </h2>
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('chatsChipAll')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 md:border-line md:bg-surface-muted/30 md:text-ink"
            />
            <button
              type="button"
              disabled={!title.trim() || create.isPending}
              onClick={() => create.mutate()}
              className="shrink-0 rounded-xl bg-[#3390ec] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              +
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {(data?.items ?? []).map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm md:border-line/50"
              >
                <span className="font-medium">{f.title}</span>
                <span className="text-xs text-white/55 md:text-ink-muted">{f.chatIds.length}</span>
              </div>
            ))}
            {(data?.items ?? []).length === 0 && (
              <p className="text-sm text-white/55 md:text-ink-muted">{t('noChatsFound')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
