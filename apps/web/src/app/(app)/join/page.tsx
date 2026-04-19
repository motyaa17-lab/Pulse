'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/lib/i18n';

export default function JoinLandingPage() {
  const t = useT();
  const router = useRouter();
  const [token, setToken] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = token
      .trim()
      .replace(/^.*\/join\/g\//i, '')
      .replace(/^\/?/, '');
    if (slug.length < 8) return;
    router.push(`/join/g/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">{t('joinLandingTitle')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('joinLandingSubtitle')}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-ink">
          {t('joinLandingLabel')}
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface-muted/30 px-3 py-2.5 font-mono text-sm outline-none focus:border-accent dark:border-line/45"
            placeholder={t('joinLandingPlaceholder')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-45"
          disabled={token.trim().length < 8}
        >
          {t('joinLandingSubmit')}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        <Link href="/join/channel" className="font-medium text-accent">
          {t('joinLandingSwitchChannel')}
        </Link>
      </p>
      <Link href="/chats" className="mt-4 inline-block text-sm font-medium text-accent">
        {t('joinGroupBackToList')}
      </Link>
    </div>
  );
}
