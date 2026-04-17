'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useT } from '@/lib/i18n';

type SessionRow = {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
};

export default function SessionsPage() {
  const t = useT();
  const qc = useQueryClient();
  const { data } = useQuery<SessionRow[]>({
    queryKey: ['sessions'],
    queryFn: () => apiFetch<SessionRow[]>('/sessions'),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => apiFetch(`/sessions/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const revokeOthers = useMutation({
    mutationFn: () => apiFetch('/sessions/revoke-others', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/settings" className="text-sm text-accent">
        {t('backToSettings')}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t('devicesTitle')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('devicesSubtitle')}</p>

      <button
        type="button"
        className="mt-6 rounded-xl border border-line px-3 py-2 text-sm text-ink hover:border-accent/40"
        onClick={() => revokeOthers.mutate()}
      >
        {t('signOutOtherSessions')}
      </button>

      <ul className="mt-6 space-y-3">
        {data?.map((s: SessionRow) => (
          <li
            key={s.id}
            className="rounded-2xl border border-line bg-surface-elevated p-4 text-sm text-ink"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{s.userAgent ?? t('unknownDevice')}</p>
                <p className="text-xs text-ink-muted">{s.ip ?? t('ipUnknown')}</p>
                <p className="mt-1 text-[11px] text-ink-muted">
                  {t('lastActive')} {new Date(s.lastActiveAt).toLocaleString()}
                </p>
                {s.isCurrent && (
                  <span className="mt-2 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {t('thisDevice')}
                  </span>
                )}
              </div>
              {!s.isCurrent && (
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() => revoke.mutate(s.id)}
                >
                  {t('revoke')}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
