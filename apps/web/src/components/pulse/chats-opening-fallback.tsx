'use client';

import { useT } from '@/lib/i18n';

/** Client-only Suspense fallback so copy is fully localized. */
export function ChatsOpeningFallback() {
  const t = useT();
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line/70 bg-surface-elevated shadow-sm">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
            stroke="currentColor"
            className="text-ink-muted"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-4 font-display text-xl font-semibold text-ink">{t('openingInbox')}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-muted">{t('syncingChats')}</p>
    </div>
  );
}
