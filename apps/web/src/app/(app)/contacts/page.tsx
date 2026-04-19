'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export default function ContactsPlaceholderPage() {
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
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white/80 md:bg-surface-muted md:text-ink-muted">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-white md:text-ink">
          {t('contactsPlaceholderTitle')}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60 md:text-ink-muted">
          {t('contactsPlaceholderHint')}
        </p>
        <Link
          href="/chats"
          className="mt-8 rounded-full bg-[#3390ec] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#2b7fd4] md:bg-accent md:hover:opacity-95"
        >
          {t('tabBarChats')}
        </Link>
      </div>
    </div>
  );
}
