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
        className="fixed inset-0 z-[140] bg-black/50 backdrop-blur-[2px] md:bg-black/50"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed z-[141] flex flex-col border border-line/80 bg-surface-elevated shadow-2xl dark:border-line/50 dark:bg-[#17212b]',
          'max-md:inset-0 max-md:h-[100dvh] max-md:w-full max-md:max-w-none max-md:rounded-none max-md:border-0',
          'md:left-1/2 md:top-[max(4.5rem,env(safe-area-inset-top)+3rem)] md:h-auto md:max-h-[min(72vh,28rem)] md:w-[min(100%-1.5rem,26rem)] md:-translate-x-1/2 md:rounded-2xl md:border md:p-3',
        )}
        role="dialog"
        aria-label={t('chatSearchTitle')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-line/70 px-3 py-2.5 dark:border-white/[0.08] md:hidden">
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-white">
            {t('chatSearchTitle')}
          </h2>
        </div>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3',
            'md:px-0 md:pb-0 md:pt-0',
          )}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('chatSearchPlaceholder')}
            className={cn(
              'w-full rounded-xl border border-line/70 bg-surface-muted/40 px-3 py-2.5 text-base text-ink outline-none ring-accent/25 placeholder:text-ink-muted focus:ring-2 dark:border-white/[0.08] dark:bg-[#111921] dark:text-white dark:placeholder:text-white/45 md:text-sm md:dark:border-line/45 md:dark:bg-surface-muted/25 md:dark:text-ink md:dark:placeholder:text-ink-muted/65',
            )}
            autoFocus
          />
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto scrollbar-thin md:max-h-[min(50vh,20rem)]">
            {!ok && (
              <p className="px-1 py-3 text-center text-xs text-ink-muted dark:text-white/50 md:dark:text-ink-muted">
                {t('chatSearchHint')}
              </p>
            )}
            {ok && isFetching && (
              <p className="px-1 py-3 text-center text-xs text-ink-muted dark:text-white/50 md:dark:text-ink-muted">
                {t('searching')}
              </p>
            )}
            {ok && !isFetching && results.length === 0 && (
              <p className="px-1 py-3 text-center text-xs text-ink-muted dark:text-white/50 md:dark:text-ink-muted">
                {t('chatSearchNoResults')}
              </p>
            )}
            {ok &&
              !isFetching &&
              results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="w-full rounded-xl px-2 py-3 text-left text-sm transition hover:bg-surface-muted/70 active:bg-surface-muted/90 dark:hover:bg-white/[0.06] dark:active:bg-white/[0.08] md:py-2.5 md:dark:hover:bg-surface-muted/30"
                  onClick={() => {
                    onClose();
                    router.push(`/chats/${chatId}?highlight=${encodeURIComponent(r.id)}`);
                  }}
                >
                  <p className="line-clamp-2 text-ink dark:text-white/95 md:dark:text-ink">
                    {r.snippet}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] tabular-nums text-ink-muted dark:text-white/45 md:dark:text-ink-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
