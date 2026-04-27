'use client';

import { Suspense } from 'react';
import { ChatsOpeningFallback } from '@/components/pulse/chats-opening-fallback';
import { useT } from '@/lib/i18n';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';

export default function ChatsIndexPage() {
  return (
    <Suspense fallback={<ChatsOpeningFallback />}>
      <ChatsIndexContent />
    </Suspense>
  );
}

function ChatsIndexContent() {
  const t = useT();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const token = useAuthStore((s) => s.accessToken);
  const sessionStatus = useAuthStore((s) => s.sessionStatus);
  const canQuery = hasHydrated && Boolean(token);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!canQuery) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCount(null);

    void (async () => {
      try {
        const rows = await apiFetch<unknown[]>('/chats');
        if (cancelled) return;
        setCount(Array.isArray(rows) ? rows.length : 0);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load chats');
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canQuery]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-xl font-semibold text-ink">Chats raw fetch</p>
      <p className="mt-2 text-sm text-ink-muted">
        canQuery={String(canQuery)} hydrated={String(hasHydrated)} token={String(Boolean(token))}{' '}
        session=
        {sessionStatus}
      </p>
      <p className="mt-1 text-xs text-ink-muted/80">{t('openingInbox')}</p>

      <div className="mt-4 w-full max-w-xl text-left text-sm text-ink">
        {loading ? <div>Loading…</div> : null}
        {error ? <div>Error: {error}</div> : null}
        {!loading && !error && count === null ? <div>Idle</div> : null}
        {!loading && !error && count !== null ? <div>Chats count: {count}</div> : null}
      </div>
    </div>
  );
}
