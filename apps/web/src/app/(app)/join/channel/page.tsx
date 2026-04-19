'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/lib/i18n';

export default function JoinChannelLandingPage() {
  const t = useT();
  const router = useRouter();
  const [token, setToken] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let slug = token.trim();
    const fromPath = slug.match(/\/join\/c\/([^/?#]+)/i);
    if (fromPath) slug = decodeURIComponent(fromPath[1]);
    slug = slug.replace(/^@/, '');
    if (slug.length < 2) return;
    router.push(`/join/c/${encodeURIComponent(slug)}`);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 text-white md:text-ink">
      <h1 className="font-display text-2xl font-semibold md:text-ink">
        {t('joinChannelLandingTitle')}
      </h1>
      <p className="mt-2 text-sm text-white/65 md:text-ink-muted">
        {t('joinChannelLandingSubtitle')}
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm font-medium md:text-ink">
          {t('joinChannelLandingLabel')}
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-sky-400/50 md:border-line md:bg-surface-muted/30 md:text-ink md:focus:border-accent dark:md:border-line/45"
            placeholder={t('joinChannelLandingPlaceholder')}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white disabled:opacity-45 md:bg-accent"
          disabled={token.trim().length < 2}
        >
          {t('joinChannelLandingSubmit')}
        </button>
      </form>
      <div className="mt-8 flex flex-col gap-2 text-sm">
        <Link href="/join" className="font-medium text-sky-300 md:text-accent">
          {t('joinChannelLandingSwitchGroup')}
        </Link>
        <Link href="/chats" className="text-white/70 md:text-ink-muted">
          {t('joinGroupBackToList')}
        </Link>
      </div>
    </div>
  );
}
