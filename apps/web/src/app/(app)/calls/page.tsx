'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function CallsPlaceholderPage() {
  const t = useT();
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-y-auto bg-[#0e1621] px-6 py-10 text-white md:max-h-none md:flex-none md:bg-transparent md:text-ink">
      <Link
        href="/chats"
        className="text-sm text-sky-300 hover:text-sky-200 md:text-accent md:hover:underline"
      >
        ← {t('backToChats')}
      </Link>
      <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 md:bg-surface-muted">
          <svg
            className="text-white/80 md:text-ink-muted"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-white md:text-ink">
          {t('callsPlaceholderTitle')}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60 md:text-ink-muted">
          {t('callsPlaceholderHint')}
        </p>
      </div>
    </div>
  );
}
