'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useMemo } from 'react';

function formatBytes(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function DataStorageSettingsPage() {
  const t = useT();
  const qc = useQueryClient();

  const { data } = useQuery<{
    attachmentsCount: number;
    attachmentsBytes: number;
    storiesCount: number;
    storiesBytes: number;
  }>({
    queryKey: ['storage-usage'],
    queryFn: () => apiFetch('/storage/usage'),
  });

  const clear = useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; deletedFiles: number; deletedBytes: number }>('/storage/clear', {
        method: 'POST',
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['storage-usage'] }),
  });

  const total = useMemo(() => {
    const a = data?.attachmentsBytes ?? 0;
    const s = data?.storiesBytes ?? 0;
    return a + s;
  }, [data?.attachmentsBytes, data?.storiesBytes]);

  return (
    <div className="mx-auto max-h-full min-h-0 w-full max-w-lg flex-1 overflow-y-auto bg-[#0e1621] px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white md:bg-transparent md:px-6 md:py-10 md:text-ink">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sky-300 md:text-accent"
        >
          ← {t('settings')}
        </Link>
        <span className="font-display text-lg font-semibold">{t('settingsDataAndStorage')}</span>
        <span className="w-10" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#17212b]/85 md:border-line/70 md:bg-surface-elevated/80">
        <div className="px-4 pb-2 pt-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45 md:text-ink-muted">
            {t('settingsDataAndStorage')}
          </h2>
        </div>
        <div className="space-y-2 px-4 pb-4 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:border-line/50">
            <span className="text-white/75 md:text-ink-muted">Uploads</span>
            <span className="font-semibold text-white md:text-ink">
              {formatBytes(data?.attachmentsBytes ?? 0)} · {data?.attachmentsCount ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:border-line/50">
            <span className="text-white/75 md:text-ink-muted">Stories</span>
            <span className="font-semibold text-white md:text-ink">
              {formatBytes(data?.storiesBytes ?? 0)} · {data?.storiesCount ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:border-line/50">
            <span className="text-white/75 md:text-ink-muted">Total</span>
            <span className="font-semibold text-white md:text-ink">{formatBytes(total)}</span>
          </div>
          <button
            type="button"
            disabled={clear.isPending}
            onClick={() => clear.mutate()}
            className="mt-2 w-full rounded-xl bg-[#3390ec] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Clear cache
          </button>
          <p className="text-xs text-white/50 md:text-ink-muted">
            This clears orphaned uploads on the server without deleting messages (Telegram-like).
          </p>
        </div>
      </div>
    </div>
  );
}
