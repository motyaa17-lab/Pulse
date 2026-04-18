'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n';

type SearchHit = { id: string; createdAt: string; snippet: string };

export function ChatSearchOverlay({
  open,
  onClose,
  chatId,
}: {
  open: boolean;
  onClose: () => void;
  chatId: string;
}) {
  const t = useT();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebounced(q.trim()), 280);
    return () => window.clearTimeout(tmr);
  }, [q]);

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const ok = debounced.length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ['chat-search', chatId, debounced],
    queryFn: () =>
      apiFetch<{ results: SearchHit[] }>(
        `/chats/${chatId}/messages/search?q=${encodeURIComponent(debounced)}`,
      ),
    enabled: open && ok,
  });

  if (!open || typeof document === 'undefined') return null;

  const results = data?.results ?? [];

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px]"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed left-1/2 top-[max(4.5rem,env(safe-area-inset-top)+3rem)] z-[141] w-[min(100%-1.5rem,26rem)] -translate-x-1/2',
          'rounded-2xl border border-line/80 bg-surface-elevated p-3 shadow-2xl dark:border-line/50 dark:bg-surface-elevated/98',
        )}
        role="dialog"
        aria-label={t('chatSearchTitle')}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('chatSearchPlaceholder')}
          className="w-full rounded-xl border border-line/70 bg-surface-muted/40 px-3 py-2.5 text-sm text-ink outline-none ring-accent/25 placeholder:text-ink-muted focus:ring-2 dark:border-line/45 dark:bg-surface-muted/25"
          autoFocus
        />
        <div className="mt-2 max-h-[min(50vh,20rem)] overflow-y-auto scrollbar-thin">
          {!ok && (
            <p className="px-1 py-3 text-center text-xs text-ink-muted">{t('chatSearchHint')}</p>
          )}
          {ok && isFetching && (
            <p className="px-1 py-3 text-center text-xs text-ink-muted">{t('searching')}</p>
          )}
          {ok && !isFetching && results.length === 0 && (
            <p className="px-1 py-3 text-center text-xs text-ink-muted">
              {t('chatSearchNoResults')}
            </p>
          )}
          {ok &&
            !isFetching &&
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                className="w-full rounded-xl px-2 py-2.5 text-left text-sm transition hover:bg-surface-muted/70 dark:hover:bg-surface-muted/30"
                onClick={() => {
                  onClose();
                  router.push(`/chats/${chatId}?highlight=${encodeURIComponent(r.id)}`);
                }}
              >
                <p className="line-clamp-2 text-ink">{r.snippet}</p>
                <p className="mt-0.5 text-[0.65rem] tabular-nums text-ink-muted">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
